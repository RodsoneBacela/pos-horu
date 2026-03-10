"use server";

import { revalidatePath }   from "next/cache";
import { auth }             from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { criarVendaSchema } from "@/lib/validations/venda.schema";

async function gerarNumeroVenda(): Promise<string> {
  const ano   = new Date().getFullYear();
  const count = await prisma.venda.count({
    where: { createdAt: { gte: new Date(`${ano}-01-01`), lte: new Date(`${ano}-12-31`) } },
  });
  return `V-${ano}-${String(count + 1).padStart(5, "0")}`;
}

async function gerarNumeroFatura(): Promise<string> {
  const ano   = new Date().getFullYear();
  const count = await prisma.fatura.count({
    where: { dataEmissao: { gte: new Date(`${ano}-01-01`), lte: new Date(`${ano}-12-31`) } },
  });
  return `FAT-${ano}-${String(count + 1).padStart(5, "0")}`;
}

export async function criarVendaAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Não autenticado" };

  const validated = criarVendaSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const {
    itens, metodoPagamento, clienteNome, clienteNif,
    desconto, caixaId, observacoes,
  } = validated.data;

  const caixa = await prisma.caixa.findFirst({
    where: { id: caixaId, estado: "ABERTA" },
  });
  if (!caixa) return { error: "Caixa não está aberta" };

  // Calcular totais
  const subtotal    = itens.reduce((s, i) => s + i.subtotal, 0);
  const descontoAmt = subtotal * (desconto / 100);
  const baseIva     = subtotal - descontoAmt;
  const totalIva    = itens.reduce((s, i) => {
    const itemBase = i.subtotal * (1 - desconto / 100);
    return s + itemBase * (i.taxaIva / 100);
  }, 0);
  const total = baseIva + totalIva;

  try {
    const [numeroVenda, numeroFatura] = await Promise.all([
      gerarNumeroVenda(),
      gerarNumeroFatura(),
    ]);

    const result = await prisma.$transaction(async (tx) => {

      // 1. Criar venda — campos exactos do schema
      const venda = await tx.venda.create({
        data: {
          numero:          numeroVenda,
          userId:          session.user.id,
          caixaId,
          metodoPagamento,
          clienteNome,
          clienteNif,
          subtotal,
          totalDesconto:   descontoAmt,  
          totalIva,
          total,
          valorPago:       total, 
          troco:           0,
          estado:          "CONCLUIDA",
          observacoes,
          itens: {
            create: itens.map(item => ({
              produtoId:   item.produtoId,
              nomeProduto: item.nomeProduto,
              quantidade:  item.quantidade,
              precoUnit:   item.precoUnitario, 
              taxaIva:     item.taxaIva,
              desconto:    item.desconto,
              subtotal:    item.subtotal,
            })),
          },
        },
      });

      for (const item of itens) {
        const produto = await tx.produto.findUnique({
          where:  { id: item.produtoId },
          select: { stockActual: true, nome: true },
        });
        if (!produto) throw new Error(`Produto não encontrado`);
        if (produto.stockActual < item.quantidade) {
          throw new Error(`Stock insuficiente: ${item.nomeProduto}`);
        }

        const novoStock = produto.stockActual - item.quantidade;

        await tx.produto.update({
          where: { id: item.produtoId },
          data:  { stockActual: novoStock },
        });

        await tx.movimentoStock.create({
          data: {
            produtoId:        item.produtoId,
            tipo:             "SAIDA_VENDA",
            quantidade:       item.quantidade,
            quantidadeAntes:  produto.stockActual,
            quantidadeDepois: novoStock,
            referencia:       venda.id, 
            tipoReferencia:   "VENDA", 
            motivo:           `Venda ${numeroVenda}`,
            userId:           session.user.id,
          },
        });
      }

      const fatura = await tx.fatura.create({
        data: {
          numero:  numeroFatura,
          serie:   "A",
          vendaId: venda.id,
        },
      });

      const updateCaixa: any = {
        totalVendas: { increment: total },
        qtdVendas:   { increment: 1 },
      };

      if      (metodoPagamento === "DINHEIRO")                                    updateCaixa.totalDinheiro = { increment: total };
      else if (metodoPagamento === "MPESA")                                        updateCaixa.totalMpesa    = { increment: total };
      else if (metodoPagamento === "EMOLA")                                        updateCaixa.totalEmola    = { increment: total };
      else if (metodoPagamento === "CARTAO_DEBITO" || metodoPagamento === "CARTAO_CREDITO") updateCaixa.totalCartao = { increment: total };
      else if (metodoPagamento === "TRANSFERENCIA")                                updateCaixa.totalTransf   = { increment: total };

      await tx.caixa.update({
        where: { id: caixaId },
        data:  updateCaixa,
      });

      return { venda, fatura };
    });

    revalidatePath("/pos");
    revalidatePath("/dashboard");
    revalidatePath("/stock");
    revalidatePath("/faturas");
    revalidatePath("/caixa");

    return {
      success:      true,
      vendaId:      result.venda.id,
      numeroVenda:  result.venda.numero,
      numeroFatura: result.fatura.numero,
      total,
      subtotal,
      totalDesconto: descontoAmt,
      totalIva,
      metodoPagamento,
      clienteNome:   clienteNome ?? null,
      itens: itens.map(item => ({
        nomeProduto:   item.nomeProduto,
        quantidade:    item.quantidade,
        precoUnitario: item.precoUnitario,
        taxaIva:       item.taxaIva,
        subtotal:      item.subtotal,
      })),
    };

  } catch (e: any) {
    return { error: e.message ?? "Erro ao processar venda" };
  }
}
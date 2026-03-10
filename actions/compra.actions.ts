"use server";

import { revalidatePath }  from "next/cache";
import { auth }            from "@/lib/auth";
import { prisma }          from "@/lib/prisma";
import { fornecedorSchema, criarCompraSchema } from "@/lib/validations/compra.schema";

async function gerarNumeroCompra(): Promise<string> {
  const ano   = new Date().getFullYear();
  const count = await prisma.compraOrdem.count({
    where: { createdAt: { gte: new Date(`${ano}-01-01`), lte: new Date(`${ano}-12-31`) } },
  });
  return `OC-${ano}-${String(count + 1).padStart(5, "0")}`;
}

export async function criarFornecedorAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Não autenticado" };

  const validated = fornecedorSchema.safeParse(formData);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const { nif } = validated.data;
  if (nif) {
    const existe = await prisma.fornecedor.findUnique({ where: { nif } });
    if (existe) return { error: "NIF já registado" };
  }

  await prisma.fornecedor.create({ data: validated.data });
  revalidatePath("/fornecedores");
  revalidatePath("/compras");
  return { success: true };
}

export async function editarFornecedorAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Não autenticado" };

  const validated = fornecedorSchema.safeParse(formData);
  if (!validated.success) return { error: validated.error.issues[0].message };

  await prisma.fornecedor.update({ where: { id }, data: validated.data });
  revalidatePath("/fornecedores");
  revalidatePath("/compras");
  return { success: true };
}

export async function toggleFornecedorAction(id: string, activo: boolean) {
  const session = await auth();
  if (!session?.user) return { error: "Não autenticado" };

  await prisma.fornecedor.update({ where: { id }, data: { activo } });
  revalidatePath("/fornecedores");
  return { success: true };
}

export async function criarCompraAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Não autenticado" };

  const validated = criarCompraSchema.safeParse(formData);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const { fornecedorId, nrFactura, observacoes, itens } = validated.data;

  const subtotal  = itens.reduce((s, i) => s + i.subtotal, 0);
  const totalItens = itens.reduce((s, i) => s + i.quantidade, 0);
  // IVA calculado com base nos produtos
  const produtosDb = await prisma.produto.findMany({
    where: { id: { in: itens.map(i => i.produtoId) } },
    include: { taxaIva: true },
  });
  const ivaMap: Record<string, number> = {};
  for (const p of produtosDb) ivaMap[p.id] = Number(p.taxaIva.taxa);

  const totalIva = itens.reduce((s, i) => {
    const taxa = ivaMap[i.produtoId] ?? 0;
    return s + i.subtotal * (taxa / 100);
  }, 0);
  const total = subtotal + totalIva;

  try {
    const numero = await gerarNumeroCompra();

    await prisma.$transaction(async (tx) => {
      // 1. Criar ordem de compra
      const compra = await tx.compraOrdem.create({
        data: {
          numero,
          fornecedorId,
          userId:      session.user.id,
          nrFactura,
          observacoes,
          totalItens,
          subtotal,
          totalIva,
          total,
          estado:      "RECEBIDA",
          itens: {
            create: itens.map(i => ({
              produtoId:   i.produtoId,
              nomeProduto: i.nomeProduto,
              quantidade:  i.quantidade,
              precoUnit:   i.precoUnit,
              subtotal:    i.subtotal,
              lote:        i.lote ?? null,
              validade:    i.validade ?? null,
            })),
          },
        },
      });

      for (const item of itens) {
        const produto = await tx.produto.findUnique({
          where:  { id: item.produtoId },
          select: { stockActual: true },
        });
        if (!produto) throw new Error(`Produto não encontrado`);

        const novoStock = produto.stockActual + item.quantidade;

        await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            stockActual: novoStock,
            precoCompra: item.precoUnit, 
            ...(item.lote    ? { lote:    item.lote }    : {}),
            ...(item.validade? { validade:item.validade } : {}),
          },
        });

        await tx.movimentoStock.create({
          data: {
            produtoId:        item.produtoId,
            tipo:             "ENTRADA_COMPRA",
            quantidade:       item.quantidade,
            quantidadeAntes:  produto.stockActual,
            quantidadeDepois: novoStock,
            referencia:       compra.id,
            tipoReferencia:   "COMPRA",
            motivo:           `Compra ${numero}`,
            userId:           session.user.id,
          },
        });
      }
    });

    revalidatePath("/compras");
    revalidatePath("/stock");
    revalidatePath("/dashboard");
    revalidatePath("/produtos");
    return { success: true, numero };

  } catch (e: any) {
    return { error: e.message ?? "Erro ao registar compra" };
  }
}
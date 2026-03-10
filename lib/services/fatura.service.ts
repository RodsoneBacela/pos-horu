import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export interface FaturaFilters {
  search?:  string;
  metodo?:  string;
  dataIni?: string;
  dataFim?: string;
  page?:    number;
  pageSize?: number;
}

export async function getFaturas(filters: FaturaFilters = {}) {
  const {
    search,
    metodo,
    dataIni,
    dataFim,
    page     = 1,
    pageSize = 20,
  } = filters;

  const where: Prisma.FaturaWhereInput = {};

  if (search) {
    where.OR = [
      { numero:            { contains: search, mode: "insensitive" } },
      { venda: { numero:   { contains: search, mode: "insensitive" } } },
      { venda: { clienteNome: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (metodo) {
    where.venda = { ...where.venda as any, metodoPagamento: metodo as any };
  }

  if (dataIni || dataFim) {
    where.dataEmissao = {
      ...(dataIni ? { gte: new Date(dataIni) } : {}),
      ...(dataFim ? { lte: new Date(dataFim + "T23:59:59") } : {}),
    };
  }

  const [faturas, total] = await Promise.all([
    prisma.fatura.findMany({
      where,
      include: {
        venda: {
          include: {
            itens: {
              include: {
                produto: { select: { unidade: { select: { abreviatura: true } } } },
              },
            },
            user: { select: { nome: true } },
          },
        },
      },
      orderBy: { dataEmissao: "desc" },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    prisma.fatura.count({ where }),
  ]);

  return {
    faturas: faturas.map(f => ({
      id:          f.id,
      numero:      f.numero,
      serie:       f.serie,
      dataEmissao: f.dataEmissao.toISOString(),
      observacoes: f.observacoes,
      venda: {
        id:              f.venda.id,
        numero:          f.venda.numero,
        clienteNome:     f.venda.clienteNome,
        clienteNif:      f.venda.clienteNif,
        metodoPagamento: f.venda.metodoPagamento,
        subtotal:        Number(f.venda.subtotal),
        totalDesconto:   Number(f.venda.totalDesconto),
        totalIva:        Number(f.venda.totalIva),
        total:           Number(f.venda.total),
        estado:          f.venda.estado,
        createdAt:       f.venda.createdAt.toISOString(),
        utilizador:      f.venda.user.nome,
        itens: f.venda.itens.map(i => ({
          id:           i.id,
          nomeProduto:  i.nomeProduto,
          quantidade:   i.quantidade,
          precoUnit:    Number(i.precoUnit),
          taxaIva:      Number(i.taxaIva),
          desconto:     Number(i.desconto),
          subtotal:     Number(i.subtotal),
          unidade:      i.produto.unidade.abreviatura ?? "un",
        })),
      },
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export type FaturaItem    = Awaited<ReturnType<typeof getFaturas>>["faturas"][number];
export type FaturaVenda   = FaturaItem["venda"];
export type FaturaVendaItem = FaturaVenda["itens"][number];
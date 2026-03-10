import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export interface StockFilters {
  search?:     string;
  categoriaId?: string;
  alerta?:     "todos" | "baixo" | "esgotado" | "vencer";
  page?:       number;
  pageSize?:   number;
}

export async function getStockProdutos(filters: StockFilters = {}) {
  const {
    search,
    categoriaId,
    alerta   = "todos",
    page     = 1,
    pageSize = 20,
  } = filters;

  const where: Prisma.ProdutoWhereInput = { activo: true };

  if (search) {
    where.OR = [
      { nome:   { contains: search, mode: "insensitive" } },
      { codigo: { contains: search, mode: "insensitive" } },
      { lote:   { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoriaId) where.categoriaId = categoriaId;
  if (alerta === "esgotado") where.stockActual = 0;

  const produtos = await prisma.produto.findMany({
    where,
    include: {
      categoria: { select: { id: true, nome: true, cor: true } },
      unidade:   { select: { abreviatura: true } },
    },
    orderBy: { stockActual: "asc" },
    skip:    (page - 1) * pageSize,
    take:    pageSize,
  });

  const total = await prisma.produto.count({ where });

  let filtrados = produtos;
  if (alerta === "baixo")   filtrados = produtos.filter(p => p.stockActual > 0 && p.stockActual <= p.stockMinimo);
  if (alerta === "vencer") {
    const em30dias = new Date();
    em30dias.setDate(em30dias.getDate() + 30);
    filtrados = produtos.filter(p => p.validade && new Date(p.validade) <= em30dias);
  }

  return {
    produtos: filtrados.map(p => ({
      id:          p.id,
      codigo:      p.codigo,
      nome:        p.nome,
      stockActual: p.stockActual,
      stockMinimo: p.stockMinimo,
      stockMaximo: p.stockMaximo,
      validade:    p.validade ? p.validade.toISOString() : null,
      lote:        p.lote,
      precoCompra: Number(p.precoCompra),
      precoVenda:  Number(p.precoVenda),
      categoria: {
        nome: p.categoria.nome,
        cor:  p.categoria.cor ?? "#64748b",
      },
      unidade: p.unidade.abreviatura ?? "un",
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    // KPIs
    resumo: {
      totalProdutos: total,
      esgotados:     produtos.filter(p => p.stockActual === 0).length,
      stockBaixo:    produtos.filter(p => p.stockActual > 0 && p.stockActual <= p.stockMinimo).length,
      aVencer:       produtos.filter(p => {
        if (!p.validade) return false;
        const em30 = new Date(); em30.setDate(em30.getDate() + 30);
        return new Date(p.validade) <= em30;
      }).length,
    },
  };
}

export async function getMovimentosProduto(produtoId: string) {
  const movimentos = await prisma.movimentoStock.findMany({
    where:   { produtoId },
    include: { user: { select: { nome: true } } },
    orderBy: { createdAt: "desc" },
    take:    20,
  });

  return movimentos.map(m => ({
    id:               m.id,
    tipo:             m.tipo,
    quantidade:       m.quantidade,
    quantidadeAntes:  m.quantidadeAntes,
    quantidadeDepois: m.quantidadeDepois,
    motivo:           m.motivo,
    referencia:       m.referencia,
    tipoReferencia:   m.tipoReferencia,
    utilizador:       m.user.nome,
    createdAt:        m.createdAt.toISOString(),
  }));
}

export type StockProduto   = Awaited<ReturnType<typeof getStockProdutos>>["produtos"][number];
export type StockMovimento = Awaited<ReturnType<typeof getMovimentosProduto>>[number];
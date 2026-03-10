import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export interface ProdutoFilters {
  search?:      string;
  categoriaId?: string;
  estado?:      "todos" | "activo" | "inactivo" | "stock_baixo" | "esgotado";
  page?:        number;
  pageSize?:    number;
}

function serializarProduto(p: any) {
  return {
    ...p,
    precoCompra: Number(p.precoCompra),
    precoVenda:  Number(p.precoVenda),
    validade:    p.validade ? p.validade.toISOString() : null,
    createdAt:   p.createdAt ? p.createdAt.toISOString() : null,
    updatedAt:   p.updatedAt ? p.updatedAt.toISOString() : null,
    taxaIva: p.taxaIva ? {
      ...p.taxaIva,
      taxa: Number(p.taxaIva.taxa),
    } : undefined,
  };
}

export async function getProdutos(filters: ProdutoFilters = {}) {
  const {
    search,
    categoriaId,
    estado   = "todos",
    page     = 1,
    pageSize = 15,
  } = filters;

  const where: Prisma.ProdutoWhereInput = {};

  if (search) {
    where.OR = [
      { nome:         { contains: search, mode: "insensitive" } },
      { codigo:       { contains: search, mode: "insensitive" } },
      { codigoBarras: { contains: search, mode: "insensitive" } },
      { fabricante:   { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoriaId)        where.categoriaId = categoriaId;
  if (estado === "activo")   where.activo = true;
  if (estado === "inactivo") where.activo = false;
  if (estado === "esgotado") where.stockActual = 0;

  const [produtos, total] = await Promise.all([
    prisma.produto.findMany({
      where,
      include: {
        categoria: { select: { id: true, nome: true, cor: true } },
        unidade:   { select: { id: true, nome: true, abreviatura: true } },
        taxaIva:   { select: { id: true, nome: true, taxa: true } },
      },
      orderBy: { nome: "asc" },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    prisma.produto.count({ where }),
  ]);

  const produtosFiltrados = estado === "stock_baixo"
    ? produtos.filter(p => p.stockActual > 0 && p.stockActual <= p.stockMinimo)
    : produtos;

  return {
    produtos:   produtosFiltrados.map(serializarProduto),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProdutoById(id: string) {
  const p = await prisma.produto.findUnique({
    where: { id },
    include: {
      categoria: true,
      unidade:   true,
      taxaIva:   true,
    },
  });
  if (!p) return null;
  return serializarProduto(p);
}

export async function getCategorias() {
  return prisma.categoria.findMany({ orderBy: { nome: "asc" } });
}

export async function getUnidades() {
  return prisma.unidadeMedida.findMany({ orderBy: { nome: "asc" } });
}

export async function getTaxasIva() {
  const taxas = await prisma.taxaIva.findMany({ orderBy: { taxa: "asc" } });
  return taxas.map(t => ({ ...t, taxa: Number(t.taxa) }));
}

export type ProdutoSerializado = ReturnType<typeof serializarProduto>;
export type ProdutoComRelacoes = Awaited<ReturnType<typeof getProdutos>>["produtos"][number];
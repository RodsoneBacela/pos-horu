import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getFornecedores(search?: string) {
  const where: Prisma.FornecedorWhereInput = { activo: true };
  if (search) {
    where.OR = [
      { nome:     { contains: search, mode: "insensitive" } },
      { nif:      { contains: search, mode: "insensitive" } },
      { telefone: { contains: search, mode: "insensitive" } },
    ];
  }
  const fornecedores = await prisma.fornecedor.findMany({
    where,
    orderBy: { nome: "asc" },
    include: { _count: { select: { compras: true } } },
  });
  return fornecedores.map(f => ({
    ...f,
    createdAt:    f.createdAt.toISOString(),
    updatedAt:    f.updatedAt.toISOString(),
    totalCompras: f._count.compras,
  }));
}

export async function getCompras(filters: {
  search?:      string;
  fornecedorId?: string;
  estado?:      string;
  page?:        number;
  pageSize?:    number;
} = {}) {
  const { search, fornecedorId, estado, page = 1, pageSize = 15 } = filters;

  const where: Prisma.CompraOrdemWhereInput = {};
  if (search) {
    where.OR = [
      { numero:    { contains: search, mode: "insensitive" } },
      { nrFactura: { contains: search, mode: "insensitive" } },
      { fornecedor: { nome: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (fornecedorId) where.fornecedorId = fornecedorId;
  if (estado)       where.estado = estado as any;

  const [compras, total] = await Promise.all([
    prisma.compraOrdem.findMany({
      where,
      include: {
        fornecedor: { select: { id: true, nome: true } },
        user:       { select: { nome: true } },
        itens:      true,
      },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    prisma.compraOrdem.count({ where }),
  ]);

  return {
    compras: compras.map(c => ({
      id:           c.id,
      numero:       c.numero,
      estado:       c.estado,
      nrFactura:    c.nrFactura,
      observacoes:  c.observacoes,
      totalItens:   c.totalItens,
      subtotal:     Number(c.subtotal),
      totalIva:     Number(c.totalIva),
      total:        Number(c.total),
      createdAt:    c.createdAt.toISOString(),
      fornecedor:   c.fornecedor,
      utilizador:   c.user.nome,
      itens: c.itens.map(i => ({
        id:          i.id,
        nomeProduto: i.nomeProduto,
        quantidade:  i.quantidade,
        precoUnit:   Number(i.precoUnit),
        subtotal:    Number(i.subtotal),
        lote:        i.lote,
        validade:    i.validade?.toISOString() ?? null,
      })),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProdutosParaCompra() {
  const produtos = await prisma.produto.findMany({
    where:   { activo: true },
    select: {
      id:          true,
      nome:        true,
      codigo:      true,
      precoCompra: true,
      stockActual: true,
      stockMinimo: true,
      taxaIva:     { select: { taxa: true } },
      unidade:     { select: { abreviatura: true } },
    },
    orderBy: { nome: "asc" },
  });
  return produtos.map(p => ({
    ...p,
    precoCompra: Number(p.precoCompra),
    taxaIva:     Number(p.taxaIva.taxa),
    unidade:     p.unidade.abreviatura ?? "un",
  }));
}

export type FornecedorItem  = Awaited<ReturnType<typeof getFornecedores>>[number];
export type CompraItem      = Awaited<ReturnType<typeof getCompras>>["compras"][number];
export type ProdutoCompra   = Awaited<ReturnType<typeof getProdutosParaCompra>>[number];
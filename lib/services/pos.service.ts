import { prisma } from "@/lib/prisma";

export async function getProdutosParaPOS() {
  const produtos = await prisma.produto.findMany({
    where:   { activo: true },
    include: {
      categoria: { select: { id: true, nome: true, cor: true } },
      unidade:   { select: { abreviatura: true } },
      taxaIva:   { select: { taxa: true } },
    },
    orderBy: { nome: "asc" },
  });

  return produtos.map(p => ({
    id:           p.id,
    nome:         p.nome,
    codigo:       p.codigo,
    codigoBarras: p.codigoBarras,
    precoVenda:   Number(p.precoVenda),
    taxaIva:      Number(p.taxaIva.taxa),
    stockActual:  p.stockActual,
    stockMinimo:  p.stockMinimo,
    unidade:      p.unidade.abreviatura,
    categoria: {
      id:   p.categoria.id,
      nome: p.categoria.nome,
      cor:  p.categoria.cor ?? "#64748b",
    },
  }));
}

// Caixa aberta actual
export async function getCaixaAberta() {
  const caixa = await prisma.caixa.findFirst({
    where:   { estado: "ABERTA" },
    orderBy: { abertaEm: "desc" },
    select:  { id: true, abertaEm: true, saldoInicial: true },
  });
  if (!caixa) return null;
  return {
    ...caixa,
    saldoInicial: Number(caixa.saldoInicial),
    abertaEm:     caixa.abertaEm.toISOString(),
  };
}

export type ProdutoPOS = Awaited<ReturnType<typeof getProdutosParaPOS>>[number];
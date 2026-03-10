import { prisma } from "@/lib/prisma";

export async function getCaixaActual() {
  const caixa = await prisma.caixa.findFirst({
    where:   { estado: "ABERTA" },
    orderBy: { abertaEm: "desc" },
    include: { user: { select: { nome: true } } },
  });

  if (!caixa) return null;

  return {
    id:             caixa.id,
    estado:         caixa.estado,
    saldoInicial:   Number(caixa.saldoInicial),
    totalVendas:    Number(caixa.totalVendas),
    totalDinheiro:  Number(caixa.totalDinheiro),
    totalMpesa:     Number(caixa.totalMpesa),
    totalEmola:     Number(caixa.totalEmola),
    totalCartao:    Number(caixa.totalCartao),
    totalTransf:    Number(caixa.totalTransf),
    qtdVendas:      caixa.qtdVendas,
    observacoes:    caixa.observacoes,
    abertaEm:       caixa.abertaEm.toISOString(),
    fechadaEm:      caixa.fechadaEm?.toISOString() ?? null,
    utilizador:     caixa.user.nome,
  };
}

export async function getHistoricoCaixas() {
  const caixas = await prisma.caixa.findMany({
    where:   { estado: "FECHADA" },
    orderBy: { abertaEm: "desc" },
    take:    30,
    include: { user: { select: { nome: true } } },
  });

  return caixas.map(c => ({
    id:            c.id,
    saldoInicial:  Number(c.saldoInicial),
    saldoFinal:    Number(c.saldoFinal ?? 0),
    totalVendas:   Number(c.totalVendas),
    totalDinheiro: Number(c.totalDinheiro),
    totalMpesa:    Number(c.totalMpesa),
    totalEmola:    Number(c.totalEmola),
    totalCartao:   Number(c.totalCartao),
    totalTransf:   Number(c.totalTransf),
    qtdVendas:     c.qtdVendas,
    abertaEm:      c.abertaEm.toISOString(),
    fechadaEm:     c.fechadaEm?.toISOString() ?? null,
    utilizador:    c.user.nome,
  }));
}

export type CaixaActual   = NonNullable<Awaited<ReturnType<typeof getCaixaActual>>>;
export type CaixaHistorico = Awaited<ReturnType<typeof getHistoricoCaixas>>[number];
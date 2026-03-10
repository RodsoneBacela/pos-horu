import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function getDashboardData() {
  const hoje     = new Date();
  const inicioDia = startOfDay(hoje);
  const fimDia   = endOfDay(hoje);

  const [
    vendasHoje,
    vendasOntem,
    totalProdutos,
    stockBaixo,
    produtosAVencer,
    caixaActual,
    vendasSemana,
    topProdutos,
    ultimasVendas,
  ] = await Promise.all([

    prisma.venda.aggregate({
      where: {
        createdAt: { gte: inicioDia, lte: fimDia },
        estado: "CONCLUIDA",
      },
      _sum:   { total: true },
      _count: { id: true },
    }),

    prisma.venda.aggregate({
      where: {
        createdAt: {
          gte: startOfDay(subDays(hoje, 1)),
          lte: endOfDay(subDays(hoje, 1)),
        },
        estado: "CONCLUIDA",
      },
      _sum: { total: true },
    }),

    prisma.produto.count({
      where: { activo: true },
    }),

prisma.produto.findMany({
  where: {
    activo: true,
  },
  select: {
    id:          true,
    nome:        true,
    codigo:      true,
    stockActual: true,
    stockMinimo: true,
    categoria:   { select: { nome: true } },
  },
  orderBy: { stockActual: "asc" },
  take: 8,
}).then(produtos =>
  produtos.filter(p => p.stockActual <= p.stockMinimo)
),

    prisma.produto.findMany({
      where: {
        activo:   true,
        validade: {
          gte: hoje,
          lte: subDays(hoje, -30), 
        },
      },
      select: {
        id:       true,
        nome:     true,
        validade: true,
        stockActual: true,
      },
      orderBy: { validade: "asc" },
      take: 5,
    }),

    prisma.caixa.findFirst({
      where:   { estado: "ABERTA" },
      orderBy: { abertaEm: "desc" },
      select: {
        id:            true,
        saldoInicial:  true,
        totalVendas:   true,
        totalDinheiro: true,
        totalMpesa:    true,
        totalCartao:   true,
        qtdVendas:     true,
        abertaEm:      true,
      },
    }),

    Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const dia    = subDays(hoje, 6 - i);
        const inicio = startOfDay(dia);
        const fim    = endOfDay(dia);
        return prisma.venda
          .aggregate({
            where: {
              createdAt: { gte: inicio, lte: fim },
              estado: "CONCLUIDA",
            },
            _sum: { total: true },
          })
          .then((r) => ({
            dia:   format(dia, "EEE", { locale: undefined }),
            data:  format(dia, "dd/MM"),
            total: Number(r._sum.total ?? 0),
          }));
      })
    ),

    prisma.vendaItem.groupBy({
      by: ["produtoId", "nomeProduto"],
      where: {
        venda: {
          createdAt: { gte: inicioDia, lte: fimDia },
          estado: "CONCLUIDA",
        },
      },
      _sum:   { quantidade: true, subtotal: true },
      _count: { id: true },
      orderBy: { _sum: { subtotal: "desc" } },
      take: 5,
    }),

    // Últimas 6 vendas
    prisma.venda.findMany({
      where:   { estado: "CONCLUIDA" },
      orderBy: { createdAt: "desc" },
      take:    6,
      select: {
        id:             true,
        numero:         true,
        total:          true,
        metodoPagamento: true,
        clienteNome:    true,
        createdAt:      true,
        itens:          { select: { id: true } },
      },
    }),
  ]);

  const receitaHoje   = Number(vendasHoje._sum.total   ?? 0);
  const receitaOntem  = Number(vendasOntem._sum.total  ?? 0);
  const variacaoReceita = receitaOntem > 0
    ? ((receitaHoje - receitaOntem) / receitaOntem) * 100
    : 0;

  return {
    kpis: {
      receitaHoje,
      variacaoReceita,
      vendasHoje:   vendasHoje._count.id,
      totalProdutos,
      stockBaixoCount: stockBaixo.length,
      saldoCaixa:   caixaActual
        ? Number(caixaActual.saldoInicial) + Number(caixaActual.totalDinheiro)
        : 0,
      caixaAberta:  !!caixaActual,
      caixaAbertoAs: caixaActual?.abertaEm ?? null,
    },
    grafico:        vendasSemana,
    stockBaixo,
    produtosAVencer,
    topProdutos,
    ultimasVendas,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
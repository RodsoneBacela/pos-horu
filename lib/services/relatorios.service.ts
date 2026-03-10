import { prisma } from "@/lib/prisma";

export interface RelatorioFiltros {
  dataIni: string;
  dataFim: string;
}

export async function getRelatorioVendas({ dataIni, dataFim }: RelatorioFiltros) {
  const ini = new Date(dataIni);
  const fim = new Date(dataFim + "T23:59:59");

  const vendas = await prisma.venda.findMany({
    where: {
      estado:    "CONCLUIDA",
      createdAt: { gte: ini, lte: fim },
    },
    include: {
      itens: true,
      user:  { select: { nome: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const porDia: Record<string, { data: string; total: number; qtd: number }> = {};
  for (const v of vendas) {
    const dia = v.createdAt.toISOString().slice(0, 10);
    if (!porDia[dia]) porDia[dia] = { data: dia, total: 0, qtd: 0 };
    porDia[dia].total += Number(v.total);
    porDia[dia].qtd   += 1;
  }

  const porMetodo: Record<string, number> = {};
  for (const v of vendas) {
    const m = v.metodoPagamento;
    porMetodo[m] = (porMetodo[m] ?? 0) + Number(v.total);
  }

  const totalVendas    = vendas.reduce((s, v) => s + Number(v.total), 0);
  const totalDesconto  = vendas.reduce((s, v) => s + Number(v.totalDesconto), 0);
  const totalIva       = vendas.reduce((s, v) => s + Number(v.totalIva), 0);
  const totalTransac   = vendas.length;
  const ticketMedio    = totalTransac > 0 ? totalVendas / totalTransac : 0;

  return {
    totalVendas,
    totalDesconto,
    totalIva,
    totalTransac,
    ticketMedio,
    porDia:    Object.values(porDia),
    porMetodo: Object.entries(porMetodo).map(([metodo, total]) => ({ metodo, total })),
  };
}

export async function getRelatorioProdutos({ dataIni, dataFim }: RelatorioFiltros) {
  const ini = new Date(dataIni);
  const fim = new Date(dataFim + "T23:59:59");

  const itens = await prisma.vendaItem.findMany({
    where: {
      venda: {
        estado:    "CONCLUIDA",
        createdAt: { gte: ini, lte: fim },
      },
    },
    include: {
      produto: {
        select: {
          nome:      true,
          codigo:    true,
          precoVenda: true,
          precoCompra: true,
          categoria: { select: { nome: true, cor: true } },
        },
      },
    },
  });

  const porProduto: Record<string, {
    produtoId:   string;
    nome:        string;
    codigo:      string;
    categoria:   string;
    cor:         string;
    qtdVendida:  number;
    totalVendas: number;
    totalCusto:  number;
    lucro:       number;
  }> = {};

  for (const item of itens) {
    const id = item.produtoId;
    if (!porProduto[id]) {
      porProduto[id] = {
        produtoId:   id,
        nome:        item.nomeProduto,
        codigo:      item.produto.codigo,
        categoria:   item.produto.categoria.nome,
        cor:         item.produto.categoria.cor ?? "#64748b",
        qtdVendida:  0,
        totalVendas: 0,
        totalCusto:  0,
        lucro:       0,
      };
    }
    const custo = Number(item.produto.precoCompra) * item.quantidade;
    porProduto[id].qtdVendida  += item.quantidade;
    porProduto[id].totalVendas += Number(item.subtotal);
    porProduto[id].totalCusto  += custo;
    porProduto[id].lucro       += Number(item.subtotal) - custo;
  }

  return Object.values(porProduto)
    .sort((a, b) => b.totalVendas - a.totalVendas)
    .slice(0, 20);
}

export async function getRelatorioStock() {
  const produtos = await prisma.produto.findMany({
    where:   { activo: true },
    include: {
      categoria: { select: { nome: true, cor: true } },
      unidade:   { select: { abreviatura: true } },
    },
    orderBy: { stockActual: "asc" },
  });

  const hoje  = new Date();
  const em30  = new Date(); em30.setDate(em30.getDate() + 30);

  return {
    totalProdutos:  produtos.length,
    valorStock:     produtos.reduce((s, p) => s + Number(p.precoCompra) * p.stockActual, 0),
    valorVenda:     produtos.reduce((s, p) => s + Number(p.precoVenda)  * p.stockActual, 0),
    esgotados:      produtos.filter(p => p.stockActual === 0),
    stockBaixo:     produtos.filter(p => p.stockActual > 0 && p.stockActual <= p.stockMinimo),
    aVencer:        produtos.filter(p => p.validade && new Date(p.validade) <= em30 && new Date(p.validade) > hoje),
    vencidos:       produtos.filter(p => p.validade && new Date(p.validade) <= hoje),
    distribuicao:   calcularDistribuicao(produtos),
  };
}

function calcularDistribuicao(produtos: any[]) {
  const cats: Record<string, { nome: string; cor: string; valor: number; qtd: number }> = {};
  for (const p of produtos) {
    const n = p.categoria.nome;
    if (!cats[n]) cats[n] = { nome: n, cor: p.categoria.cor ?? "#64748b", valor: 0, qtd: 0 };
    cats[n].valor += Number(p.precoVenda) * p.stockActual;
    cats[n].qtd   += p.stockActual;
  }
  return Object.values(cats).sort((a, b) => b.valor - a.valor);
}
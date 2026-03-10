import { requireAuth }      from "@/lib/auth-guard";
import { getDashboardData } from "@/lib/services/dashboard.service";
import { KpiCard }          from "@/components/dashboard/kpi-card";
import { SalesChart }       from "@/components/dashboard/sales-chart";
import { StockAlerts }      from "@/components/dashboard/stock-alerts";
import { RecentSales }      from "@/components/dashboard/recent-sales";
import { TopProducts }      from "@/components/dashboard/top-products";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Wallet,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export const metadata = { title: "Dashboard — HoruPOS" };

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ erro?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const params  = await searchParams;
  const data    = await getDashboardData();
  const { kpis, grafico, stockBaixo, topProdutos, ultimasVendas } = data;

  const hoje = new Date().toLocaleDateString("pt-MZ", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  });

  return (
    <div className="space-y-6">
        {params.erro === "sem-permissao" && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <span className="text-lg">🚫</span>
          <p>Não tens permissão para aceder a essa página.</p>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">
            {hoje} — Bem-vindo, <strong className="text-gray-700">{session.user.name}</strong>
          </p>
        </div>

        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border
          ${kpis.caixaAberta
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50   text-red-600   border-red-200"}
        `}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            kpis.caixaAberta ? "bg-green-500 animate-pulse" : "bg-red-400"
          }`} />
          {kpis.caixaAberta
            ? `Caixa Aberta · ${new Date(kpis.caixaAbertoAs!).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}`
            : "Caixa Fechada"}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Receita Hoje"
          value={`MT ${kpis.receitaHoje.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}`}
          change={kpis.variacaoReceita}
          changeLabel="vs ontem"
          icon={<DollarSign className="w-4 h-4" />}
          iconColor="blue"
        />
        <KpiCard
          label="Vendas Hoje"
          value={kpis.vendasHoje.toString()}
          changeLabel="transacções"
          icon={<ShoppingCart className="w-4 h-4" />}
          iconColor="green"
        />
        <KpiCard
          label="Produtos em Stock"
          value={kpis.totalProdutos.toString()}
          change={kpis.stockBaixoCount > 0 ? -kpis.stockBaixoCount : undefined}
          changeLabel={kpis.stockBaixoCount > 0 ? `${kpis.stockBaixoCount} abaixo do mín.` : "Stock em ordem"}
          icon={<Package className="w-4 h-4" />}
          iconColor={kpis.stockBaixoCount > 0 ? "amber" : "green"}
        />
        <KpiCard
          label="Saldo em Caixa"
          value={`MT ${kpis.saldoCaixa.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}`}
          changeLabel={kpis.caixaAberta ? "Caixa aberta" : "Caixa fechada"}
          icon={<Wallet className="w-4 h-4" />}
          iconColor="purple"
        />
      </div>

      {/* ── Gráfico + Alertas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold text-gray-900">Vendas — Últimos 7 Dias</h2>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
              MT {grafico.reduce((s, d) => s + d.total, 0).toLocaleString("pt-MZ", { maximumFractionDigits: 0 })} total
            </span>
          </div>
          <div className="px-4 py-4">
            <SalesChart data={grafico} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold text-gray-900">Alertas de Stock</h2>
            </div>
            {stockBaixo.length > 0 && (
              <span className="text-[10px] font-mono font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                {stockBaixo.length}
              </span>
            )}
          </div>
          <div className="px-4 py-4">
            <StockAlerts items={stockBaixo} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Produtos */}
        <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-900">Top Produtos Hoje</h2>
          </div>
          <div className="px-5 py-4">
            <TopProducts products={topProdutos} />
          </div>
        </div>

        {/* Últimas vendas */}
        <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <ShoppingCart className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-900">Últimas Vendas</h2>
          </div>
          <div className="px-4 py-2">
            <RecentSales vendas={ultimasVendas} />
          </div>
        </div>
      </div>

    </div>
  );
}
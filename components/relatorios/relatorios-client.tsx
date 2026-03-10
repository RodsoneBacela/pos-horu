"use client";

import { useRouter }          from "next/navigation";
import { BarChart2, Package, Warehouse, } from "lucide-react";
import { cn }                 from "@/lib/utils";
import { RelVendas }          from "@/components/relatorios/rel-vendas";
import { RelProdutos }        from "@/components/relatorios/rel-produtos";
import { RelStock }           from "@/components/relatorios/rel-stock";

const TABS = [
  { id: "vendas",   label: "Vendas",   icon: BarChart2  },
  { id: "produtos", label: "Produtos", icon: Package    },
  { id: "stock",    label: "Stock",    icon: Warehouse  },
];

const PERIODOS = [
  { label: "Hoje",        dias: 0  },
  { label: "7 dias",      dias: 7  },
  { label: "Este mês",    dias: -1 },
  { label: "30 dias",     dias: 30 },
  { label: "90 dias",     dias: 90 },
];

function fmt(n: number) {
  return Number(n ?? 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 });
}

interface RelatoriosClientProps {
  vendas:    any;
  produtos:  any[];
  stock:     any;
  dataIni:   string;
  dataFim:   string;
  tabActiva: string;
}

export function RelatoriosClient({ vendas, produtos, stock, dataIni, dataFim, tabActiva }: RelatoriosClientProps) {
  const router = useRouter();

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams({ dataIni, dataFim, tab: tabActiva });
    params.set(key, value);
    router.push(`/relatorios?${params.toString()}`);
  }

  function setPeriodo(dias: number) {
    const fim = new Date();
    const ini = new Date();
    if (dias === 0)  { /* hoje — ini = fim */ }
    else if (dias === -1) { ini.setDate(1); }
    else { ini.setDate(fim.getDate() - dias); }
    updateParams("dataIni", ini.toISOString().slice(0, 10));
    const params = new URLSearchParams({ dataIni, dataFim, tab: tabActiva });
    params.set("dataIni", ini.toISOString().slice(0, 10));
    params.set("dataFim", fim.toISOString().slice(0, 10));
    router.push(`/relatorios?${params.toString()}`);
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Análise de desempenho do negócio</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {PERIODOS.map(p => (
            <button
              key={p.label}
              onClick={() => setPeriodo(p.dias)}
              className="px-3 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={dataIni}
              onChange={e => updateParams("dataIni", e.target.value)}
              className="h-8 px-3 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400 text-xs">até</span>
            <input
              type="date"
              value={dataFim}
              onChange={e => updateParams("dataFim", e.target.value)}
              className="h-8 px-3 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => updateParams("tab", id)}
            className={cn(
              "flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-semibold transition-all",
              tabActiva === id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {tabActiva === "vendas"   && <RelVendas   data={vendas}   dataIni={dataIni} dataFim={dataFim} />}
      {tabActiva === "produtos" && <RelProdutos  data={produtos} />}
      {tabActiva === "stock"    && <RelStock     data={stock}    />}
    </div>
  );
}
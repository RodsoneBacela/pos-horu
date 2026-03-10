"use client";

import { Package, AlertTriangle, PackageX, Clock, TrendingUp } from "lucide-react";

function fmt(n: number) {
  return Number(n ?? 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 });
}

export function RelStock({ data }: { data: any }) {
  const margem = data.valorVenda > 0
    ? ((data.valorVenda - data.valorStock) / data.valorVenda * 100)
    : 0;

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Produtos",   value: data.totalProdutos,          icon: Package,       cor: "text-blue-600   bg-blue-50   border-blue-200" },
          { label: "Valor em Custo",   value: `${fmt(data.valorStock)} MT`, icon: TrendingUp,    cor: "text-purple-600 bg-purple-50 border-purple-200" },
          { label: "Valor em Venda",   value: `${fmt(data.valorVenda)} MT`, icon: TrendingUp,    cor: "text-green-600  bg-green-50  border-green-200" },
          { label: "Margem Potencial", value: `${margem.toFixed(1)}%`,     icon: TrendingUp,    cor: "text-amber-600  bg-amber-50  border-amber-200" },
        ].map(({ label, value, icon: Icon, cor }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 border ${cor.split(" ").slice(1).join(" ")}`}>
              <Icon className={`w-4 h-4 ${cor.split(" ")[0]}`} />
            </div>
            <p className="text-xl font-bold text-gray-900 font-mono">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">

        <div className="space-y-3">
          {[
            { label: "Esgotados",    items: data.esgotados, icon: PackageX,      cor: "border-red-200    bg-red-50    text-red-700" },
            { label: "Stock Baixo",  items: data.stockBaixo,icon: AlertTriangle, cor: "border-amber-200  bg-amber-50  text-amber-700" },
            { label: "A Vencer",     items: data.aVencer,   icon: Clock,         cor: "border-orange-200 bg-orange-50 text-orange-700" },
            { label: "Vencidos",     items: data.vencidos,  icon: AlertTriangle, cor: "border-red-200    bg-red-50    text-red-700" },
          ].map(({ label, items, icon: Icon, cor }) => (
            <div key={label} className={`rounded-xl border p-4 ${cor.split(" ").slice(0, 2).join(" ")}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${cor.split(" ")[2]}`} />
                  <span className={`text-sm font-bold ${cor.split(" ")[2]}`}>{label}</span>
                </div>
                <span className={`text-lg font-black font-mono ${cor.split(" ")[2]}`}>{items.length}</span>
              </div>
              {items.length > 0 && (
                <div className="space-y-1 mt-2">
                  {items.slice(0, 3).map((p: any) => (
                    <p key={p.id} className="text-xs text-gray-600 truncate">
                      • {p.nome}
                      <span className="text-gray-400 ml-1 font-mono">({p.stockActual} un)</span>
                    </p>
                  ))}
                  {items.length > 3 && (
                    <p className="text-xs text-gray-400">+ {items.length - 3} mais...</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Valor por Categoria</h3>
          {data.distribuicao.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem dados</p>
          ) : (
            <div className="space-y-3">
              {data.distribuicao.map((cat: any) => {
                const pct = data.valorVenda > 0 ? (cat.valor / data.valorVenda) * 100 : 0;
                return (
                  <div key={cat.nome}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.cor }} />
                        {cat.nome}
                      </span>
                      <span className="text-xs font-mono text-gray-500">{fmt(cat.valor)} MT</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: cat.cor }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{pct.toFixed(1)}% do valor total · {cat.qtd} un</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
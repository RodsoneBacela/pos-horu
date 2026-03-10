"use client";

import { useState } from "react";
import { cn }       from "@/lib/utils";

function fmt(n: number) {
  return Number(n ?? 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 });
}

export function RelProdutos({ data }: { data: any[] }) {
  const [ordem, setOrdem] = useState<"totalVendas" | "qtdVendida" | "lucro">("totalVendas");

  const ordenado = [...data].sort((a, b) => b[ordem] - a[ordem]);
  const maxVendas = Math.max(...data.map(p => p.totalVendas), 1);

  const totais = {
    vendas: data.reduce((s, p) => s + p.totalVendas, 0),
    custo:  data.reduce((s, p) => s + p.totalCusto, 0),
    lucro:  data.reduce((s, p) => s + p.lucro, 0),
    qtd:    data.reduce((s, p) => s + p.qtdVendida, 0),
  };

  const margem = totais.vendas > 0 ? (totais.lucro / totais.vendas) * 100 : 0;

  return (
    <div className="space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Vendido",   value: `${fmt(totais.vendas)} MT`, cor: "text-blue-600" },
          { label: "Custo Total",     value: `${fmt(totais.custo)} MT`,  cor: "text-red-600" },
          { label: "Lucro Bruto",     value: `${fmt(totais.lucro)} MT`,  cor: "text-green-600" },
          { label: "Margem Média",    value: `${margem.toFixed(1)}%`,    cor: "text-purple-600" },
        ].map(({ label, value, cor }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
            <p className={`text-xl font-bold font-mono ${cor}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Top Produtos</h3>
          <div className="flex gap-1">
            {[
              { key: "totalVendas", label: "Por Vendas" },
              { key: "qtdVendida",  label: "Por Qtd." },
              { key: "lucro",       label: "Por Lucro" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setOrdem(key as any)}
                className={cn(
                  "px-3 h-7 rounded-lg text-xs font-semibold transition-all",
                  ordem === key
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {data.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Sem vendas no período seleccionado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["#", "Produto", "Categoria", "Qtd.", "Vendas", "Custo", "Lucro", "Margem"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide font-mono whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ordenado.map((p, i) => {
                  const margem = p.totalVendas > 0 ? (p.lucro / p.totalVendas) * 100 : 0;
                  const pct    = (p.totalVendas / maxVendas) * 100;
                  return (
                    <tr key={p.produtoId} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold font-mono text-gray-400">#{i + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">{p.nome}</p>
                        <div className="w-24 h-1 bg-gray-100 rounded-full mt-1">
                          <div className="h-1 bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-xs text-gray-600">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.cor }} />
                          {p.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold font-mono text-gray-900">{p.qtdVendida}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold font-serif text-gray-900">{fmt(p.totalVendas)} MT</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-red-600">{fmt(p.totalCusto)} MT</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold font-mono text-green-600">{fmt(p.lucro)} MT</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-xs font-bold font-mono px-2 py-0.5 rounded-full",
                          margem >= 30 ? "bg-green-50 text-green-700" :
                          margem >= 15 ? "bg-amber-50 text-amber-700" :
                                         "bg-red-50 text-red-600"
                        )}>
                          {margem.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { TrendingUp, ShoppingCart, Tag, Percent } from "lucide-react";

const METODO_LABEL: Record<string, string> = {
  DINHEIRO: "Dinheiro", MPESA: "M-Pesa", EMOLA: "e-Mola",
  CARTAO_DEBITO: "Cartão Déb.", CARTAO_CREDITO: "Cartão Créd.",
  TRANSFERENCIA: "Transf.", CREDITO: "Crédito",
};
const METODO_COR: Record<string, string> = {
  DINHEIRO: "#10b981", MPESA: "#ef4444", EMOLA: "#f97316",
  CARTAO_DEBITO: "#6366f1", CARTAO_CREDITO: "#8b5cf6",
  TRANSFERENCIA: "#06b6d4", CREDITO: "#64748b",
};

function fmt(n: number) {
  return Number(n ?? 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 });
}

export function RelVendas({ data, dataIni, dataFim }: { data: any; dataIni: string; dataFim: string }) {
  const kpis = [
    { label: "Total Vendas",    value: `${fmt(data.totalVendas)} MT`,   icon: TrendingUp,   cor: "text-blue-600   bg-blue-50   border-blue-200" },
    { label: "Nº Transacções",  value: data.totalTransac,               icon: ShoppingCart, cor: "text-green-600  bg-green-50  border-green-200" },
    { label: "Ticket Médio",    value: `${fmt(data.ticketMedio)} MT`,   icon: Tag,          cor: "text-purple-600 bg-purple-50 border-purple-200" },
    { label: "Total IVA",       value: `${fmt(data.totalIva)} MT`,      icon: Percent,      cor: "text-amber-600  bg-amber-50  border-amber-200" },
  ];

  return (
    <div className="space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, cor }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 border ${cor.split(" ").slice(1).join(" ")}`}>
              <Icon className={`w-4 h-4 ${cor.split(" ")[0]}`} />
            </div>
            <p className="text-xl font-bold text-gray-900 font-mono">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de vendas por dia */}
      <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Vendas por Dia</h3>
        {data.porDia.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            Sem vendas no período seleccionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.porDia} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="data" tick={{ fontSize: 10, fontFamily: "monospace" }}
                tickFormatter={d => new Date(d).toLocaleDateString("pt-MZ", { day: "2-digit", month: "2-digit" })}
              />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k MT`} />
              <Tooltip
                formatter={(v: any) => [`${fmt(v)} MT`, "Vendas"]}
                labelFormatter={l => new Date(l).toLocaleDateString("pt-MZ")}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
              />
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#gradVendas)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Por Método de Pagamento</h3>
          {data.porMetodo.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem dados</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.porMetodo} layout="vertical" margin={{ left: 60, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="metodo" tick={{ fontSize: 10 }}
                  tickFormatter={m => METODO_LABEL[m] ?? m}
                />
                <Tooltip
                  formatter={(v: any) => [`MT ${fmt(v)}`, "Total"]}
                  labelFormatter={l => METODO_LABEL[l] ?? l}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {data.porMetodo.map((entry: any) => (
                    <Cell key={entry.metodo} fill={METODO_COR[entry.metodo] ?? "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Resumo de descontos */}
        <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Resumo Financeiro</h3>
          <div className="space-y-3">
            {[
              { label: "Receita Bruta",   value: data.totalVendas + data.totalDesconto, cor: "text-gray-900" },
              { label: "Descontos",        value: -data.totalDesconto,                   cor: "text-red-600" },
              { label: "Receita Líquida",  value: data.totalVendas,                      cor: "text-blue-600", bold: true },
              { label: "IVA incluído",     value: data.totalIva,                         cor: "text-amber-600" },
              { label: "Sem IVA",          value: data.totalVendas - data.totalIva,      cor: "text-green-600" },
            ].map(({ label, value, cor, bold }) => (
              <div key={label} className={`flex justify-between items-center py-2 border-b border-gray-50 last:border-0 ${bold ? "font-bold" : ""}`}>
                <span className="text-xs text-gray-500">{label}</span>
                <span className={`text-sm font-mono ${cor}`}>
                  {value < 0 ? "−" : ""} {fmt(Math.abs(value))} MT
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
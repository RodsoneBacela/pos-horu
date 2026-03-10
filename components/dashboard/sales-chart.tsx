"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesChartProps {
  data: { dia: string; data: string; total: number }[];
}

function formatMT(value: number) {
  if (value >= 1000) return `MT ${(value / 1000).toFixed(1)}k`;
  return `MT ${value.toFixed(0)}`;
}

// Tooltip customizado
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-modal px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-0.5">{payload[0]?.payload?.data}</p>
      <p className="text-blue-600 font-bold font-mono">
        MT {Number(payload[0]?.value ?? 0).toLocaleString("pt-MZ")}
      </p>
    </div>
  );
}

export function SalesChart({ data }: SalesChartProps) {
  // Labels curtos dos dias em PT
  const diasPT: Record<string, string> = {
    Mon: "Seg", Tue: "Ter", Wed: "Qua",
    Thu: "Qui", Fri: "Sex", Sat: "Sáb", Sun: "Dom",
  };

  const chartData = data.map((d) => ({
    ...d,
    dia: diasPT[d.dia] ?? d.dia,
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#1a56db" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#1a56db" stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f3f4f6"
          vertical={false}
        />

        <XAxis
          dataKey="dia"
          tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tickFormatter={formatMT}
          tick={{ fontSize: 10, fill: "#9ca3af", fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
          width={60}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone"
          dataKey="total"
          stroke="#1a56db"
          strokeWidth={2}
          fill="url(#colorVendas)"
          dot={{ fill: "#1a56db", strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
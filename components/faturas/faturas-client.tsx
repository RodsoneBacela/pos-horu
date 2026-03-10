"use client";

import { useState }      from "react";
import { useRouter }     from "next/navigation";
import { Search, Eye, FileText } from "lucide-react";
import { FaturaModal }   from "@/components/faturas/fatura-modal";
import type { FaturaItem } from "@/lib/services/fatura.service";

const METODOS = [
  { value: "",               label: "Todos" },
  { value: "DINHEIRO",       label: "Dinheiro" },
  { value: "MPESA",          label: "M-Pesa" },
  { value: "EMOLA",          label: "e-Mola" },
  { value: "CARTAO_DEBITO",  label: "Cartão Débito" },
  { value: "CARTAO_CREDITO", label: "Cartão Crédito" },
  { value: "TRANSFERENCIA",  label: "Transferência" },
  { value: "CREDITO",        label: "Crédito" },
];

const METODO_ICON: Record<string, string> = {
  DINHEIRO: "💵", MPESA: "📱", EMOLA: "📱",
  CARTAO_DEBITO: "💳", CARTAO_CREDITO: "💳",
  TRANSFERENCIA: "🏦", CREDITO: "📋",
};

function fmt(n: number) {
  return Number(n ?? 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface FaturasClientProps {
  result:      any;
  searchParams: any;
}

export function FaturasClient({ result, searchParams }: FaturasClientProps) {
  const router                = useRouter();
  const [selected, setSelected] = useState<FaturaItem | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/faturas?${params.toString()}`);
  }

  return (
    <>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Faturas</h1>
            <p className="text-sm text-gray-500 mt-0.5">{result.total} fatura{result.total !== 1 ? "s" : ""} emitida{result.total !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              defaultValue={searchParams.search ?? ""}
              onChange={e => updateParam("search", e.target.value)}
              placeholder="Pesquisar nº fatura ou cliente..."
              className="pl-9 pr-4 h-9 w-64 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            defaultValue={searchParams.metodo ?? ""}
            onChange={e => updateParam("metodo", e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {METODOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>

          <input
            type="date"
            defaultValue={searchParams.dataIni ?? ""}
            onChange={e => updateParam("dataIni", e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm">até</span>
          <input
            type="date"
            defaultValue={searchParams.dataFim ?? ""}
            onChange={e => updateParam("dataFim", e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
          {result.faturas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-10 h-10 text-gray-200 mb-3" />
              <p className="font-semibold text-gray-500">Nenhuma fatura encontrada</p>
              <p className="text-sm text-gray-400 mt-1">As faturas aparecem aqui após as vendas</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Nº Fatura", "Nº Venda", "Data", "Cliente", "Pagamento", "IVA", "Total", ""].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide font-mono whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.faturas.map((f: FaturaItem) => (
                      <tr
                        key={f.id}
                        className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer"
                        onClick={() => setSelected(f)}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-bold text-blue-600">{f.numero}</span>
                          <span className="text-[10px] text-gray-400 ml-1.5 font-mono">Série {f.serie}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-500">{f.venda.numero}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600 font-mono">
                            {new Date(f.dataEmissao).toLocaleDateString("pt-MZ")}
                          </span>
                          <span className="text-[10px] text-gray-400 ml-1">
                            {new Date(f.dataEmissao).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-700">
                            {f.venda.clienteNome ?? <span className="text-gray-300 italic">—</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            <span>{METODO_ICON[f.venda.metodoPagamento] ?? "💰"}</span>
                            {METODOS.find(m => m.value === f.venda.metodoPagamento)?.label ?? f.venda.metodoPagamento}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            MT {fmt(f.venda.totalIva)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-gray-900 text-sm font-serif">
                            MT {fmt(f.venda.total)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={e => { e.stopPropagation(); setSelected(f); }}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {result.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Página {result.page} de {result.totalPages} · {result.total} resultados
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={result.page <= 1}
                      onClick={() => updateParam("page", String(result.page - 1))}
                      className="px-3 h-8 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                    >
                      ← Anterior
                    </button>
                    <button
                      disabled={result.page >= result.totalPages}
                      onClick={() => updateParam("page", String(result.page + 1))}
                      className="px-3 h-8 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors"
                    >
                      Próximo →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal detalhe */}
      <FaturaModal
        fatura={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
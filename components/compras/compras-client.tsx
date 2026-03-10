"use client";

import { useState }        from "react";
import { useRouter }       from "next/navigation";
import { Plus, Search, Eye, ShoppingBag } from "lucide-react";
import { cn }              from "@/lib/utils";
import { NovaCompraModal } from "@/components/compras/nova-compra-modal";
import type { CompraItem, FornecedorItem, ProdutoCompra } from "@/lib/services/compras.service";

const ESTADO_CONFIG: Record<string, { label: string; cor: string }> = {
  RECEBIDA:  { label: "Recebida",  cor: "bg-green-50 text-green-700 border-green-200" },
  PENDENTE:  { label: "Pendente",  cor: "bg-amber-50 text-amber-700 border-amber-200" },
  PARCIAL:   { label: "Parcial",   cor: "bg-blue-50  text-blue-700  border-blue-200"  },
  CANCELADA: { label: "Cancelada", cor: "bg-red-50   text-red-600   border-red-200"   },
};

function fmt(n: number) {
  return Number(n ?? 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 });
}

interface ComprasClientProps {
  result:       any;
  fornecedores: FornecedorItem[];
  produtos:     ProdutoCompra[];
  searchParams: any;
}

export function ComprasClient({ result, fornecedores, produtos, searchParams }: ComprasClientProps) {
  const router                         = useRouter();
  const [showModal, setShowModal]      = useState(false);
  const [detalhe,   setDetalhe]        = useState<CompraItem | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`/compras?${params.toString()}`);
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Compras</h1>
            <p className="text-sm text-gray-500 mt-0.5">{result.total} ordem{result.total !== 1 ? "s" : ""} de compra</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Compra
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              defaultValue={searchParams.search ?? ""}
              onChange={e => updateParam("search", e.target.value)}
              placeholder="Pesquisar nº ou fornecedor..."
              className="pl-9 pr-4 h-9 w-64 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            defaultValue={searchParams.fornecedorId ?? ""}
            onChange={e => updateParam("fornecedorId", e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os fornecedores</option>
            {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          <select
            defaultValue={searchParams.estado ?? ""}
            onChange={e => updateParam("estado", e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os estados</option>
            {Object.entries(ESTADO_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
          {result.compras.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ShoppingBag className="w-10 h-10 mb-3" />
              <p className="font-semibold">Nenhuma compra encontrada</p>
              <p className="text-sm mt-1">Regista a primeira ordem de compra</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Nº Ordem", "Fornecedor", "Data", "Produtos", "Total", "Estado", ""].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide font-mono whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.compras.map((c: CompraItem) => {
                      const estado = ESTADO_CONFIG[c.estado] ?? ESTADO_CONFIG.PENDENTE;
                      return (
                        <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => setDetalhe(c)}>
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs font-bold text-blue-600">{c.numero}</p>
                            {c.nrFactura && <p className="text-[10px] text-gray-400 font-mono">Fatura: {c.nrFactura}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-gray-900">{c.fornecedor.nome}</p>
                            <p className="text-xs text-gray-400">{c.utilizador}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-gray-500">
                              {new Date(c.createdAt).toLocaleDateString("pt-MZ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-gray-600">{c.totalItens} un</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-bold text-gray-900 font-serif">{fmt(c.total)} MT</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", estado.cor)}>
                              {estado.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={e => { e.stopPropagation(); setDetalhe(c); }}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {result.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500">Página {result.page} de {result.totalPages}</p>
                  <div className="flex gap-2">
                    <button disabled={result.page <= 1} onClick={() => updateParam("page", String(result.page - 1))} className="px-3 h-8 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors">← Anterior</button>
                    <button disabled={result.page >= result.totalPages} onClick={() => updateParam("page", String(result.page + 1))} className="px-3 h-8 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">Próximo →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal detalhe */}
        {detalhe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDetalhe(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="text-base font-bold text-gray-900">{detalhe.numero}</h2>
                  <p className="text-xs text-gray-400">{detalhe.fornecedor.nome} · {new Date(detalhe.createdAt).toLocaleDateString("pt-MZ")}</p>
                </div>
                <button onClick={() => setDetalhe(null)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      {["Produto", "Qtd.", "Preço", "Subtotal"].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detalhe.itens.map(i => (
                      <tr key={i.id} className="border-b border-gray-50">
                        <td className="px-3 py-2.5">
                          <p className="text-xs font-semibold text-gray-900">{i.nomeProduto}</p>
                          {i.lote && <p className="text-[10px] text-gray-400 font-mono">Lote: {i.lote}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-mono text-gray-600">{i.quantidade}</td>
                        <td className="px-3 py-2.5 text-xs font-mono text-gray-600">MT {fmt(i.precoUnit)}</td>
                        <td className="px-3 py-2.5 text-xs font-bold text-gray-900 font-serif">MT {fmt(i.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-blue-600 font-serif">MT {fmt(detalhe.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <NovaCompraModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => { setShowModal(false); router.refresh(); }}
        fornecedores={fornecedores}
        produtos={produtos}
      />
    </>
  );
}
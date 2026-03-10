"use client";

import { useState }      from "react";
import { useRouter }     from "next/navigation";
import { Search, SlidersHorizontal, AlertTriangle, PackageX, Clock, Package } from "lucide-react";
import { cn }            from "@/lib/utils";
import { AjusteModal }   from "@/components/stock/ajuste-modal";
import type { StockProduto } from "@/lib/services/stock.service";

const TIPO_LABEL: Record<string, { label: string; cor: string }> = {
  ENTRADA_COMPRA:      { label: "Entrada Compra",      cor: "text-green-600 bg-green-50 border-green-200" },
  SAIDA_VENDA:         { label: "Saída Venda",         cor: "text-blue-600 bg-blue-50 border-blue-200" },
  AJUSTE_POSITIVO:     { label: "Ajuste +",            cor: "text-green-600 bg-green-50 border-green-200" },
  AJUSTE_NEGATIVO:     { label: "Ajuste −",            cor: "text-red-600 bg-red-50 border-red-200" },
  DEVOLUCAO_CLIENTE:   { label: "Devolução Cliente",   cor: "text-amber-600 bg-amber-50 border-amber-200" },
  DEVOLUCAO_FORNECEDOR:{ label: "Devolução Forn.",     cor: "text-purple-600 bg-purple-50 border-purple-200" },
  PERDA:               { label: "Perda",               cor: "text-red-600 bg-red-50 border-red-200" },
};

interface StockClientProps {
  result:      any;
  categorias:  any[];
  searchParams: any;
}

export function StockClient({ result, categorias, searchParams }: StockClientProps) {
  const router                         = useRouter();
  const [ajusteProduto, setAjuste]     = useState<StockProduto | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/stock?${params.toString()}`);
  }

  const { resumo } = result;

  return (
    <>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stock</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão de inventário e movimentos</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Produtos", value: resumo.totalProdutos, icon: Package,       cor: "text-blue-600",  bg: "bg-blue-50",  alerta: "" },
            { label: "Stock Baixo",    value: resumo.stockBaixo,    icon: AlertTriangle, cor: "text-amber-600", bg: "bg-amber-50", alerta: "baixo" },
            { label: "Esgotados",      value: resumo.esgotados,     icon: PackageX,      cor: "text-red-600",   bg: "bg-red-50",   alerta: "esgotado" },
            { label: "A Vencer (30d)", value: resumo.aVencer,       icon: Clock,         cor: "text-purple-600",bg: "bg-purple-50",alerta: "vencer" },
          ].map(({ label, value, icon: Icon, cor, bg, alerta }) => (
            <button
              key={label}
              onClick={() => updateParam("alerta", alerta)}
              className={cn(
                "bg-white rounded-xl border border-gray-150 p-4 text-left hover:shadow-card transition-all",
                searchParams.alerta === alerta && alerta && "ring-2 ring-blue-500"
              )}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", bg)}>
                <Icon className={cn("w-4.5 h-4.5", cor)} />
              </div>
              <p className="text-2xl font-bold text-gray-900 font-mono">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              defaultValue={searchParams.search ?? ""}
              onChange={e => updateParam("search", e.target.value)}
              placeholder="Pesquisar produto ou lote..."
              className="pl-9 pr-4 h-9 w-64 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            defaultValue={searchParams.categoriaId ?? ""}
            onChange={e => updateParam("categoriaId", e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <select
            defaultValue={searchParams.alerta ?? ""}
            onChange={e => updateParam("alerta", e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="baixo">Stock Baixo</option>
            <option value="esgotado">Esgotados</option>
            <option value="vencer">A Vencer (30 dias)</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Produto", "Código", "Categoria", "Stock", "Mín.", "Validade", "Lote", "Estado", ""].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide font-mono whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.produtos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-gray-400 text-sm">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                ) : result.produtos.map((p: StockProduto) => {
                  const esgotado   = p.stockActual === 0;
                  const baixo      = !esgotado && p.stockActual <= p.stockMinimo;
                  const hoje       = new Date();
                  const em30       = new Date(); em30.setDate(em30.getDate() + 30);
                  const validadeOk = p.validade && new Date(p.validade) > hoje;
                  const aVencer    = p.validade && new Date(p.validade) <= em30 && new Date(p.validade) > hoje;
                  const vencido    = p.validade && new Date(p.validade) <= hoje;

                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 text-sm">{p.nome}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{p.codigo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.categoria.cor }} />
                          {p.categoria.nome}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-lg font-bold font-mono",
                            esgotado ? "text-red-600" : baixo ? "text-amber-600" : "text-gray-900"
                          )}>
                            {p.stockActual}
                          </span>
                          <span className="text-xs text-gray-400">{p.unidade}</span>
                        </div>
                        {/* Barra de nível */}
                        {p.stockMaximo && p.stockMaximo > 0 && (
                          <div className="w-16 h-1 bg-gray-100 rounded-full mt-1">
                            <div
                              className={cn("h-1 rounded-full transition-all", esgotado ? "bg-red-400" : baixo ? "bg-amber-400" : "bg-green-400")}
                              style={{ width: `${Math.min(100, (p.stockActual / p.stockMaximo) * 100)}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-gray-500">{p.stockMinimo}</span>
                      </td>
                      <td className="px-4 py-3">
                        {p.validade ? (
                          <span className={cn(
                            "text-xs font-mono",
                            vencido  ? "text-red-600 font-bold" :
                            aVencer  ? "text-amber-600 font-semibold" :
                            "text-gray-500"
                          )}>
                            {new Date(p.validade).toLocaleDateString("pt-MZ")}
                            {vencido && <span className="ml-1 text-[9px] bg-red-100 text-red-600 px-1 rounded">VENCIDO</span>}
                            {aVencer && <span className="ml-1 text-[9px] bg-amber-100 text-amber-600 px-1 rounded">⚠</span>}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-gray-500">{p.lote ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                          esgotado ? "bg-red-50 text-red-600 border-red-200" :
                          baixo    ? "bg-amber-50 text-amber-700 border-amber-200" :
                                     "bg-green-50 text-green-700 border-green-200"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", esgotado ? "bg-red-500" : baixo ? "bg-amber-500" : "bg-green-500")} />
                          {esgotado ? "Esgotado" : baixo ? "Stock Baixo" : "OK"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setAjuste(p)}
                          className="px-2.5 h-7 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                        >
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">Página {result.page} de {result.totalPages}</p>
              <div className="flex gap-2">
                <button
                  disabled={result.page <= 1}
                  onClick={() => updateParam("page", String(result.page - 1))}
                  className="px-3 h-8 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  ← Anterior
                </button>
                <button
                  disabled={result.page >= result.totalPages}
                  onClick={() => updateParam("page", String(result.page + 1))}
                  className="px-3 h-8 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal ajuste */}
      <AjusteModal
        produto={ajusteProduto}
        onClose={() => setAjuste(null)}
        onSuccess={() => { setAjuste(null); router.refresh(); }}
      />
    </>
  );
}
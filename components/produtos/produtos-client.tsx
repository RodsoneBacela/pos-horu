"use client";

import { useState }        from "react";
import { useRouter }       from "next/navigation";
import { Plus, Download, Search, SlidersHorizontal } from "lucide-react";
import { ProdutosTable }   from "@/components/produtos/produtos-table";
import { ProdutoModal }    from "@/components/produtos/produto-modal";

interface ProdutosClientProps {
  result:      any;
  categorias:  any[];
  unidades:    any[];
  taxasIva:    any[];
  searchParams: any;
}

export function ProdutosClient({
  result, categorias, unidades, taxasIva, searchParams,
}: ProdutosClientProps) {
  const router              = useRouter();
  const [showModal, setShowModal] = useState(false);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); 
    router.push(`/produtos?${params.toString()}`);
  }

  return (
    <div className="space-y-5">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {result.total} produto{result.total !== 1 ? "s" : ""} no catálogo
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            defaultValue={searchParams.search ?? ""}
            onChange={e => updateParam("search", e.target.value)}
            placeholder="Pesquisar produto..."
            className="pl-9 pr-4 h-9 w-64 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Categoria */}
        <select
          defaultValue={searchParams.categoriaId ?? ""}
          onChange={e => updateParam("categoriaId", e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as categorias</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        {/* Estado */}
        <select
          defaultValue={searchParams.estado ?? ""}
          onChange={e => updateParam("estado", e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os estados</option>
          <option value="activo">Activos</option>
          <option value="stock_baixo">Stock Baixo</option>
          <option value="esgotado">Esgotados</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
        <ProdutosTable
          produtos={result.produtos}
          categorias={categorias}
          unidades={unidades}
          taxasIva={taxasIva}
        />

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
      </div>

      <ProdutoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => router.refresh()}
        categorias={categorias}
        unidades={unidades}
        taxasIva={taxasIva}
      />
    </div>
  );
}
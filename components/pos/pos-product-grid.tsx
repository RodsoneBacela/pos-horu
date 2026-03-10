"use client";

import { useState, useMemo } from "react";
import { Search }            from "lucide-react";
import { cn }                from "@/lib/utils";
import { useCartStore }      from "@/stores/cart.store";
import { ProdutoPOS }        from "@/lib/services/pos.service";

interface PosProductGridProps {
  produtos: ProdutoPOS[];
}

export function PosProductGrid({ produtos }: PosProductGridProps) {
  const [search,   setSearch]   = useState("");
  const [catActiva, setCat]     = useState("Todos");
  const addItem                 = useCartStore(s => s.addItem);


  const categorias = useMemo(() => {
    const cats = [...new Set(produtos.map(p => p.categoria.nome))];
    return ["Todos", ...cats.sort()];
  }, [produtos]);

  const filtrados = useMemo(() => {
    return produtos.filter(p => {
      const matchCat    = catActiva === "Todos" || p.categoria.nome === catActiva;
      const matchSearch = !search
        || p.nome.toLowerCase().includes(search.toLowerCase())
        || p.codigo.toLowerCase().includes(search.toLowerCase())
        || p.codigoBarras?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [produtos, catActiva, search]);

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">

      {/* Search */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar produto ou código de barras..."
          className="w-full pl-10 pr-4 h-10 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Categorias */}
      <div className="flex gap-2 flex-wrap shrink-0">
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setCat(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
              catActiva === cat
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 pb-4">
          {filtrados.map(produto => {
            const esgotado = produto.stockActual === 0;
            const baixo    = !esgotado && produto.stockActual <= produto.stockMinimo;

            return (
              <button
                key={produto.id}
                onClick={() => !esgotado && addItem(produto)}
                disabled={esgotado}
                className={cn(
                  "relative bg-white rounded-xl border p-3 text-left transition-all",
                  "flex flex-col gap-1.5",
                  esgotado
                    ? "opacity-40 cursor-not-allowed border-gray-100"
                    : "border-gray-150 hover:border-blue-300 hover:shadow-card cursor-pointer active:scale-95"
                )}
              >
                {baixo && !esgotado && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                    BAIXO
                  </span>
                )}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center mb-0.5"
                  style={{ backgroundColor: produto.categoria.cor + "20" }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: produto.categoria.cor }}
                  />
                </div>

                <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">
                  {produto.nome}
                </p>

                <p className="text-sm font-bold text-blue-600 font-serif mt-auto">
                  {produto.precoVenda.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })} MT
                </p>

                <p className={cn(
                  "text-[10px] font-mono",
                  esgotado ? "text-red-400" : baixo ? "text-amber-500" : "text-gray-400"
                )}>
                  {esgotado ? "Esgotado" : `${produto.stockActual} ${produto.unidade}`}
                </p>
              </button>
            );
          })}

          {filtrados.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
              <p className="text-sm font-medium">Nenhum produto encontrado</p>
              <p className="text-xs mt-1">Tenta outra pesquisa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
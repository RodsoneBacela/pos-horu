"use client";

import { useState, useTransition } from "react";
import { useRouter }               from "next/navigation";
import { Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { StockBadge }              from "@/components/produtos/stock-badge";
import { eliminarProdutoAction }   from "@/actions/produto.actions";
import type { ProdutoComRelacoes } from "@/lib/services/produto.service";
import { cn }                      from "@/lib/utils";

interface ProdutosTableProps {
  produtos:   ProdutoComRelacoes[];
  categorias: any[];
  unidades:   any[];
  taxasIva:   any[];
}

export function ProdutosTable({
  produtos, categorias, unidades, taxasIva,
}: ProdutosTableProps) {
  const router                       = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editProduto, setEditProduto] = useState<any>(null);
  const [showModal, setShowModal]    = useState(false);

  // Import dinâmico do modal para não quebrar SSR
  const [ProdutoModal, setProdutoModal] = useState<any>(null);
  if (!ProdutoModal) {
    import("@/components/produtos/produto-modal").then(m =>
      setProdutoModal(() => m.ProdutoModal)
    );
  }

  function handleEdit(produto: any) {
    setEditProduto(produto);
    setShowModal(true);
  }

  function handleDelete(id: string, nome: string) {
    if (!confirm(`Eliminar "${nome}"?`)) return;
    startTransition(async () => {
      await eliminarProdutoAction(id);
      router.refresh();
    });
  }

  if (produtos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
          <span className="text-2xl">📦</span>
        </div>
        <p className="font-semibold text-gray-700">Nenhum produto encontrado</p>
        <p className="text-sm text-gray-400 mt-1">Cria o primeiro produto usando o botão acima</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Produto", "Código", "Categoria", "Preço Venda", "Stock", "IVA", "Validade", "Estado", ""].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide font-mono whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{p.nome}</p>
                    <p className="text-xs text-gray-400">{p.fabricante ?? "—"}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                    {p.codigo}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: p.categoria.cor ?? "#64748b" }}
                    />
                    {p.categoria.nome}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-gray-900 text-sm font-serif">
                    {p.precoVenda.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })} MT
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-base text-gray-900 font-mono">
                    {p.stockActual}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">{p.unidade.abreviatura}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {Number(p.precoVenda).toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  {p.validade ? (
                    <span className={cn(
                      "text-xs font-mono",
                      new Date(p.validade) < new Date()
                        ? "text-red-600 font-semibold"
                        : "text-gray-500"
                    )}>
                      {p.validade
                        ? new Date(p.validade).toLocaleDateString("pt-MZ")
                        : <span className="text-gray-300 text-xs">—</span>
                        }
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StockBadge
                    stockActual={p.stockActual}
                    stockMinimo={p.stockMinimo}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.nome)}
                      disabled={isPending}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ProdutoModal && showModal && (
        <ProdutoModal
          open={showModal}
          onClose={() => { setShowModal(false); setEditProduto(null); }}
          onSuccess={() => router.refresh()}
          categorias={categorias}
          unidades={unidades}
          taxasIva={taxasIva}
          produto={editProduto}
        />
      )}
    </>
  );
}
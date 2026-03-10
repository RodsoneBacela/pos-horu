"use client";

import { useState, useTransition, useMemo } from "react";
import { X, Plus, Trash2, Loader2, Search, Package } from "lucide-react";
import { criarCompraAction }                from "@/actions/compra.actions";
import type { FornecedorItem, ProdutoCompra } from "@/lib/services/compras.service";

interface NovaCompraModalProps {
  open:        boolean;
  onClose:     () => void;
  onSuccess:   () => void;
  fornecedores: FornecedorItem[];
  produtos:    ProdutoCompra[];
}

interface ItemCompra {
  produtoId:   string;
  nomeProduto: string;
  quantidade:  number;
  precoUnit:   number;
  subtotal:    number;
  lote:        string;
  validade:    string;
  unidade:     string;
}

export function NovaCompraModal({ open, onClose, onSuccess, fornecedores, produtos }: NovaCompraModalProps) {
  const [isPending,    startTransition] = useTransition();
  const [erro,         setErro]         = useState<string | null>(null);
  const [fornecedorId, setFornecedor]   = useState("");
  const [nrFactura,    setNrFactura]    = useState("");
  const [observacoes,  setObs]          = useState("");
  const [itens,        setItens]        = useState<ItemCompra[]>([]);
  const [search,       setSearch]       = useState("");
  const [showSearch,   setShowSearch]   = useState(false);

  const produtosFiltrados = useMemo(() =>
    produtos.filter(p =>
      !itens.find(i => i.produtoId === p.id) &&
      (p.nome.toLowerCase().includes(search.toLowerCase()) ||
       p.codigo.toLowerCase().includes(search.toLowerCase()))
    ).slice(0, 8),
    [produtos, itens, search]
  );

  function addProduto(p: ProdutoCompra) {
    setItens(prev => [...prev, {
      produtoId:   p.id,
      nomeProduto: p.nome,
      quantidade:  1,
      precoUnit:   p.precoCompra,
      subtotal:    p.precoCompra,
      lote:        "",
      validade:    "",
      unidade:     p.unidade,
    }]);
    setSearch("");
    setShowSearch(false);
  }

  function updateItem(idx: number, key: keyof ItemCompra, value: any) {
    setItens(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [key]: value };
      if (key === "quantidade" || key === "precoUnit") {
        updated.subtotal = Number(updated.quantidade) * Number(updated.precoUnit);
      }
      return updated;
    }));
  }

  function removeItem(idx: number) {
    setItens(prev => prev.filter((_, i) => i !== idx));
  }

  const subtotal = itens.reduce((s, i) => s + i.subtotal, 0);
  const total    = subtotal;

  function handleSubmit() {
    setErro(null);
    if (!fornecedorId) { setErro("Selecciona o fornecedor"); return; }
    if (itens.length === 0) { setErro("Adiciona pelo menos um produto"); return; }

    startTransition(async () => {
      const result = await criarCompraAction({
        fornecedorId,
        nrFactura:   nrFactura || null,
        observacoes: observacoes || null,
        itens: itens.map(i => ({
          produtoId:   i.produtoId,
          nomeProduto: i.nomeProduto,
          quantidade:  i.quantidade,
          precoUnit:   i.precoUnit,
          subtotal:    i.subtotal,
          lote:        i.lote || null,
          validade:    i.validade ? new Date(i.validade) : null,
        })),
      });

      if (result?.error) setErro(result.error);
      else {
        onSuccess();
        onClose();
        // Reset
        setFornecedor(""); setNrFactura(""); setObs(""); setItens([]);
      }
    });
  }

  if (!open) return null;

  const inp = "w-full h-8 px-2.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">Nova Ordem de Compra</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Fornecedor *</label>
              <select
                value={fornecedorId}
                onChange={e => setFornecedor(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar...</option>
                {fornecedores.map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Nº Factura Fornecedor</label>
              <input value={nrFactura} onChange={e => setNrFactura(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: FAT-2025-001" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Observações</label>
              <input value={observacoes} onChange={e => setObs(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="opcional" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide font-mono">Produtos</p>
              <button
                onClick={() => setShowSearch(s => !s)}
                className="flex items-center gap-1.5 px-3 h-7 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Adicionar Produto
              </button>
            </div>

            {showSearch && (
              <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Pesquisar produto..."
                    className="w-full pl-9 pr-4 h-8 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                  {produtosFiltrados.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addProduto(p)}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-all"
                    >
                      <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{p.nome}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{Number(p.precoCompra).toFixed(2)} MT · stock: {p.stockActual}</p>
                      </div>
                    </button>
                  ))}
                  {produtosFiltrados.length === 0 && (
                    <p className="col-span-2 text-xs text-gray-400 text-center py-3">Nenhum produto encontrado</p>
                  )}
                </div>
              </div>
            )}

            {itens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                <Package className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">Nenhum produto adicionado</p>
                <p className="text-xs mt-0.5">Clica em "Adicionar Produto" para começar</p>
              </div>
            ) : (
              <div className="border border-gray-150 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Produto", "Qtd.", "Preço Unit.", "Lote", "Validade", "Subtotal", ""].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-50">
                        <td className="px-3 py-2">
                          <p className="text-xs font-semibold text-gray-900">{item.nomeProduto}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{item.unidade}</p>
                        </td>
                        <td className="px-3 py-2 w-20">
                          <input
                            type="number" min="1"
                            value={item.quantidade}
                            onChange={e => updateItem(idx, "quantidade", parseInt(e.target.value) || 1)}
                            className={inp}
                          />
                        </td>
                        <td className="px-3 py-2 w-28">
                          <input
                            type="number" min="0" step="0.01"
                            value={item.precoUnit}
                            onChange={e => updateItem(idx, "precoUnit", parseFloat(e.target.value) || 0)}
                            className={inp}
                          />
                        </td>
                        <td className="px-3 py-2 w-24">
                          <input
                            value={item.lote}
                            onChange={e => updateItem(idx, "lote", e.target.value)}
                            className={inp}
                            placeholder="opcional"
                          />
                        </td>
                        <td className="px-3 py-2 w-32">
                          <input
                            type="date"
                            value={item.validade}
                            onChange={e => updateItem(idx, "validade", e.target.value)}
                            className={inp}
                          />
                        </td>
                        <td className="px-3 py-2 w-24">
                          <span className="text-xs font-bold font-mono text-gray-900">
                            MT {item.subtotal.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={() => removeItem(idx)} className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end items-center gap-4 px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{itens.length} produto{itens.length !== 1 ? "s" : ""} · {itens.reduce((s, i) => s + i.quantidade, 0)} unidades</span>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Subtotal</p>
                    <p className="text-base font-bold text-gray-900 font-serif">MT {subtotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">⚠ {erro}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-4 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || itens.length === 0}
            className="px-6 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPending ? "A registar..." : `Registar Compra · ${total.toFixed(2)} MT`}
          </button>
        </div>
      </div>
    </div>
  );
}
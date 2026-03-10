"use client";

import { useState, useTransition } from "react";
import { X, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { cn }                      from "@/lib/utils";
import { ajustarStockAction }      from "@/actions/produto.actions";
import type { StockProduto }       from "@/lib/services/stock.service";

interface AjusteModalProps {
  produto:   StockProduto | null;
  onClose:   () => void;
  onSuccess: () => void;
}

export function AjusteModal({ produto, onClose, onSuccess }: AjusteModalProps) {
  const [isPending, startTransition] = useTransition();
  const [tipo,      setTipo]         = useState<"AJUSTE_POSITIVO" | "AJUSTE_NEGATIVO">("AJUSTE_POSITIVO");
  const [quantidade, setQty]         = useState(1);
  const [motivo,    setMotivo]       = useState("");
  const [erro,      setErro]         = useState<string | null>(null);

  if (!produto) return null;

  const novoStock = tipo === "AJUSTE_POSITIVO"
    ? produto.stockActual + quantidade
    : produto.stockActual - quantidade;

  function handleSubmit() {
  if (!produto) return; 
  if (!motivo.trim()) { setErro("Motivo obrigatório"); return; }
  if (quantidade < 1) { setErro("Quantidade mínima é 1"); return; }
  setErro(null);

  startTransition(async () => {
    const result = await ajustarStockAction({
      produtoId: produto.id,
      tipo,
      quantidade,
      motivo,
    });

    if (result?.error) {
      setErro(result.error);
    } else {
      onSuccess();
      onClose();
    }
  });
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Ajuste de Stock</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-65">{produto.nome}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Stock actual */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-500">Stock actual</span>
            <span className="text-2xl font-bold text-gray-900 font-mono">
              {produto.stockActual} <span className="text-sm font-normal text-gray-400">{produto.unidade}</span>
            </span>
          </div>

          {/* Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTipo("AJUSTE_POSITIVO")}
              className={cn(
                "flex items-center justify-center gap-2 h-11 rounded-xl border-2 text-sm font-semibold transition-all",
                tipo === "AJUSTE_POSITIVO"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Entrada
            </button>
            <button
              onClick={() => setTipo("AJUSTE_NEGATIVO")}
              className={cn(
                "flex items-center justify-center gap-2 h-11 rounded-xl border-2 text-sm font-semibold transition-all",
                tipo === "AJUSTE_NEGATIVO"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              )}
            >
              <TrendingDown className="w-4 h-4" />
              Saída
            </button>
          </div>

          {/* Quantidade */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Quantidade *</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-lg font-bold transition-colors"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-center text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-lg font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Preview novo stock */}
          <div className={cn(
            "flex items-center justify-between rounded-xl px-4 py-3 border",
            novoStock < 0
              ? "bg-red-50 border-red-200"
              : novoStock <= produto.stockMinimo
              ? "bg-amber-50 border-amber-200"
              : "bg-green-50 border-green-200"
          )}>
            <span className="text-xs font-semibold text-gray-600">Novo stock</span>
            <span className={cn(
              "text-2xl font-bold font-mono",
              novoStock < 0 ? "text-red-600" : novoStock <= produto.stockMinimo ? "text-amber-600" : "text-green-600"
            )}>
              {novoStock} <span className="text-sm font-normal text-gray-400">{produto.unidade}</span>
            </span>
          </div>

          {/* Motivo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Motivo *</label>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="ex: Recepção de encomenda, Inventário, Correcção de erro..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠ {erro}
            </p>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || novoStock < 0}
              className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isPending ? "A guardar..." : "Confirmar Ajuste"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
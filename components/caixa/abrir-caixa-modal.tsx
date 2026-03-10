"use client";

import { useState, useTransition } from "react";
import { Loader2, DollarSign }     from "lucide-react";
import { abrirCaixaAction }        from "@/actions/caixa.actions";

interface AbrirCaixaModalProps {
  open:      boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

export function AbrirCaixaModal({ open, onClose, onSuccess }: AbrirCaixaModalProps) {
  const [isPending, startTransition] = useTransition();
  const [saldo,     setSaldo]        = useState("0");
  const [obs,       setObs]          = useState("");
  const [erro,      setErro]         = useState<string | null>(null);

  function handleSubmit() {
    setErro(null);
    startTransition(async () => {
      const result = await abrirCaixaAction({
        saldoInicial: parseFloat(saldo) || 0,
        observacoes:  obs || null,
      });
      if (result?.error) setErro(result.error);
      else { onSuccess(); onClose(); }
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-green-500 px-6 py-6 text-center text-white">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-lg font-bold">Abrir Caixa</h2>
          <p className="text-green-100 text-xs mt-0.5">
            {new Date().toLocaleDateString("pt-MZ", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Fundo de caixa inicial (MT)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={saldo}
              onChange={e => setSaldo(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 text-2xl font-bold font-mono text-center focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Observações (opcional)</label>
            <textarea
              value={obs}
              onChange={e => setObs(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="ex: Turno da manhã..."
            />
          </div>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">⚠ {erro}</p>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 h-10 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isPending ? "A abrir..." : "Abrir Caixa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
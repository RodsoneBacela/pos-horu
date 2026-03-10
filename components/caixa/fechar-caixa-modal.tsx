"use client";

import { useState, useTransition } from "react";
import { Loader2, Lock }           from "lucide-react";
import { cn }                      from "@/lib/utils";
import { fecharCaixaAction }       from "@/actions/caixa.actions";
import type { CaixaActual }        from "@/lib/services/caixa.service";

function fmt(n: number) {
  return Number(n ?? 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 });
}

interface FecharCaixaModalProps {
  open:      boolean;
  onClose:   () => void;
  onSuccess: () => void;
  caixa:     CaixaActual;
}

export function FecharCaixaModal({ open, onClose, onSuccess, caixa }: FecharCaixaModalProps) {
  const [isPending, startTransition] = useTransition();
  const [saldoFinal, setSaldoFinal]  = useState(String(
    caixa.saldoInicial + caixa.totalDinheiro
  ));
  const [obs,  setObs]  = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const totalEsperado = caixa.saldoInicial + caixa.totalDinheiro;
  const diferenca     = parseFloat(saldoFinal || "0") - totalEsperado;

  function handleSubmit() {
    if (!confirm("Confirmas o fecho de caixa?")) return;
    setErro(null);
    startTransition(async () => {
      const result = await fecharCaixaAction({
        caixaId:    caixa.id,
        saldoFinal: parseFloat(saldoFinal) || 0,
        observacoes: obs || null,
      });
      if (result?.error) setErro(result.error);
      else { onSuccess(); onClose(); }
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gray-800 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Fechar Caixa</h2>
              <p className="text-gray-400 text-xs">{caixa.qtdVendas} vendas · {fmt(caixa.totalVendas)} MT</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Resumo rápido */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Fundo inicial",  value: caixa.saldoInicial },
              { label: "Total vendas",   value: caixa.totalVendas },
              { label: "Dinheiro",       value: caixa.totalDinheiro },
              { label: "M-Pesa/e-Mola",  value: caixa.totalMpesa + caixa.totalEmola },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-gray-400 font-mono uppercase">{label}</p>
                <p className="text-sm font-bold text-gray-900 font-mono">{fmt(value)} MT</p>
              </div>
            ))}
          </div>

          {/* Saldo final contado */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Saldo final contado (MT)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={saldoFinal}
              onChange={e => setSaldoFinal(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-xl font-bold font-mono text-center focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Diferença */}
          <div className={cn(
            "flex items-center justify-between rounded-xl px-4 py-3 border",
            diferenca === 0 ? "bg-green-50 border-green-200" :
            diferenca > 0  ? "bg-blue-50 border-blue-200" :
                             "bg-red-50 border-red-200"
          )}>
            <span className="text-xs font-semibold text-gray-600">Diferença</span>
            <span className={cn(
              "text-lg font-bold font-mono",
              diferenca === 0 ? "text-green-600" :
              diferenca > 0  ? "text-blue-600" :
                               "text-red-600"
            )}>
              {diferenca >= 0 ? "+" : ""}{fmt(diferenca)} MT
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Observações (opcional)</label>
            <textarea
              value={obs}
              onChange={e => setObs(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="ex: Fecho do turno da tarde..."
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
              className="flex-1 h-10 rounded-xl bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isPending ? "A fechar..." : "Fechar Caixa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
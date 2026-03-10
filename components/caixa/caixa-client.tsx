"use client";

import { useState }          from "react";
import { useRouter }         from "next/navigation";
import { Lock, Unlock, Clock, TrendingUp, CreditCard, Smartphone, Banknote, ArrowLeftRight } from "lucide-react";
import { cn }                from "@/lib/utils";
import { AbrirCaixaModal }   from "@/components/caixa/abrir-caixa-modal";
import { FecharCaixaModal }  from "@/components/caixa/fechar-caixa-modal";
import type { CaixaActual, CaixaHistorico } from "@/lib/services/caixa.service";

function fmt(n: number) {
  return Number(n ?? 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 });
}

function duracao(ini: string, fim?: string | null) {
  const ms  = new Date(fim ?? new Date()).getTime() - new Date(ini).getTime();
  const h   = Math.floor(ms / 3600000);
  const m   = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

interface CaixaClientProps {
  caixaActual: CaixaActual | null;
  historico:   CaixaHistorico[];
}

export function CaixaClient({ caixaActual, historico }: CaixaClientProps) {
  const router                             = useRouter();
  const [showAbrir,  setShowAbrir]         = useState(false);
  const [showFechar, setShowFechar]        = useState(false);

  const metodos = caixaActual ? [
    { label: "Dinheiro",      icon: Banknote,       value: caixaActual.totalDinheiro, cor: "text-green-600  bg-green-50  border-green-200" },
    { label: "M-Pesa",        icon: Smartphone,     value: caixaActual.totalMpesa,    cor: "text-red-600    bg-red-50    border-red-200" },
    { label: "e-Mola",        icon: Smartphone,     value: caixaActual.totalEmola,    cor: "text-orange-600 bg-orange-50 border-orange-200" },
    { label: "Cartão",        icon: CreditCard,     value: caixaActual.totalCartao,   cor: "text-blue-600   bg-blue-50   border-blue-200" },
    { label: "Transferência", icon: ArrowLeftRight, value: caixaActual.totalTransf,   cor: "text-purple-600 bg-purple-50 border-purple-200" },
  ] : [];

  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Caixa</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {caixaActual ? "Caixa aberta" : "Nenhuma caixa aberta"}
            </p>
          </div>
          {caixaActual ? (
            <button
              onClick={() => setShowFechar(true)}
              className="flex items-center gap-2 px-4 h-9 rounded-lg bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Fechar Caixa
            </button>
          ) : (
            <button
              onClick={() => setShowAbrir(true)}
              className="flex items-center gap-2 px-4 h-9 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              Abrir Caixa
            </button>
          )}
        </div>

        {caixaActual ? (
          <>
            {/* KPIs principais */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm col-span-1">
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wide mb-1">Total Vendas</p>
                <p className="text-3xl font-bold text-gray-900 font-serif">{fmt(caixaActual.totalVendas)} MT</p>
                <p className="text-xs text-gray-400 mt-2 font-mono">{caixaActual.qtdVendas} transacções</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wide mb-1">Fundo Inicial</p>
                <p className="text-2xl font-bold text-gray-700 font-mono">{fmt(caixaActual.saldoInicial)} MT</p>
                <p className="text-xs text-gray-400 mt-2">por {caixaActual.utilizador}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wide mb-1">Duração</p>
                <p className="text-2xl font-bold text-gray-700 font-mono">
                  {duracao(caixaActual.abertaEm)}
                </p>
                <p className="text-xs text-gray-400 mt-2 font-mono">
                  desde {new Date(caixaActual.abertaEm).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-700 mb-3">Por método de pagamento</p>
              <div className="grid grid-cols-5 gap-3">
                {metodos.map(({ label, icon: Icon, value, cor }) => (
                  <div key={label} className={cn("rounded-xl border p-4", cor.split(" ").slice(1).join(" "))}>
                    <Icon className={cn("w-4 h-4 mb-2", cor.split(" ")[0])} />
                    <p className="text-xs text-gray-500 font-mono">{label}</p>
                    <p className={cn("text-sm font-bold font-mono mt-0.5", cor.split(" ")[0])}>
                      {fmt(value)} MT
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide font-mono">Saldo esperado em caixa</p>
                <p className="text-xs text-blue-500 mt-0.5">Fundo inicial + dinheiro recebido</p>
              </div>
              <p className="text-2xl font-bold text-blue-700 font-serif">
                {fmt(caixaActual.saldoInicial + caixaActual.totalDinheiro)} MT
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-bold text-gray-700">Caixa Fechada</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Abre a caixa para começar a receber vendas</p>
            <button
              onClick={() => setShowAbrir(true)}
              className="flex items-center gap-2 px-5 h-10 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <Unlock className="w-4 h-4" />
              Abrir Caixa Agora
            </button>
          </div>
        )}

        {historico.length > 0 && (
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">Histórico de caixas</p>
            <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Data", "Utilizador", "Vendas", "Total", "Fundo", "Saldo Final", "Duração"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide font-mono whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historico.map(c => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">
                        {new Date(c.abertaEm).toLocaleDateString("pt-MZ")}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{c.utilizador}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">{c.qtdVendas}</td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-900 font-serif">MT {fmt(c.totalVendas)}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">MT {fmt(c.saldoInicial)}</td>
                      <td className="px-4 py-3 text-xs font-bold font-mono text-blue-600">MT {fmt(c.saldoFinal)}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {duracao(c.abertaEm, c.fechadaEm)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AbrirCaixaModal
        open={showAbrir}
        onClose={() => setShowAbrir(false)}
        onSuccess={() => router.refresh()}
      />
      {caixaActual && (
        <FecharCaixaModal
          open={showFechar}
          onClose={() => setShowFechar(false)}
          onSuccess={() => router.refresh()}
          caixa={caixaActual}
        />
      )}
    </>
  );
}
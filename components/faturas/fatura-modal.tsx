"use client";

import { X, Printer, Building2, Hash, Calendar, User, CreditCard } from "lucide-react";
import type { FaturaItem } from "@/lib/services/fatura.service";

const METODO_LABEL: Record<string, string> = {
  DINHEIRO:       "Dinheiro",
  MPESA:          "M-Pesa",
  EMOLA:          "e-Mola",
  CARTAO_DEBITO:  "Cartão Débito",
  CARTAO_CREDITO: "Cartão Crédito",
  TRANSFERENCIA:  "Transferência",
  CREDITO:        "Crédito",
};

function fmt(n: number) {
  return Number(n ?? 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface FaturaModalProps {
  fatura:  FaturaItem | null;
  onClose: () => void;
}

export function FaturaModal({ fatura, onClose }: FaturaModalProps) {
  if (!fatura) return null;

  const v = fatura.venda;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{fatura.numero}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Série {fatura.serie} · {fatura.venda.numero}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Info da fatura */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Hash,      label: "Nº Fatura",   value: fatura.numero },
              { icon: Calendar,  label: "Data Emissão", value: new Date(fatura.dataEmissao).toLocaleDateString("pt-MZ") },
              { icon: User,      label: "Emitido por",  value: v.utilizador },
              { icon: CreditCard,label: "Pagamento",    value: METODO_LABEL[v.metodoPagamento] ?? v.metodoPagamento },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Cliente */}
          {(v.clienteNome || v.clienteNif) && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Cliente</span>
              </div>
              {v.clienteNome && <p className="text-sm font-semibold text-gray-900">{v.clienteNome}</p>}
              {v.clienteNif  && <p className="text-xs text-gray-500 font-mono mt-0.5">NIF: {v.clienteNif}</p>}
            </div>
          )}

          {/* Itens */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Itens</p>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Produto</th>
                    <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-12">Qty</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Preço</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-16">IVA</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {v.itens.map((item, i) => (
                    <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-3 py-2.5">
                        <p className="text-xs font-semibold text-gray-900">{item.nomeProduto}</p>
                        {item.desconto > 0 && (
                          <p className="text-[10px] text-green-600">desc. {fmt(item.desconto)}%</p>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-xs font-mono text-gray-600">
                          {item.quantidade} {item.unidade}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs font-mono text-gray-600">
                          MT {fmt(item.precoUnit)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {item.taxaIva}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs font-bold text-gray-900 font-serif">
                          MT {fmt(item.subtotal)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totais */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span>
              <span className="font-mono">MT {fmt(v.subtotal)}</span>
            </div>
            {v.totalDesconto > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Desconto</span>
                <span className="font-mono">− MT {fmt(v.totalDesconto)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>IVA</span>
              <span className="font-mono">MT {fmt(v.totalIva)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-blue-600 font-serif">MT {fmt(v.total)}</span>
            </div>
          </div>

          {/* Estado */}
          <div className="flex justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              v.estado === "CONCLUIDA"
                ? "bg-green-50 text-green-700 border-green-200"
                : v.estado === "ANULADA"
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {v.estado}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
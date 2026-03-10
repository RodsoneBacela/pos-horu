"use client";

import { CheckCircle, Printer, ShoppingCart } from "lucide-react";

const METODO_LABEL: Record<string, string> = {
  DINHEIRO:       "Dinheiro",
  MPESA:          "M-Pesa",
  EMOLA:          "e-Mola",
  CARTAO_DEBITO:  "Cartão Débito",
  CARTAO_CREDITO: "Cartão Crédito",
  TRANSFERENCIA:  "Transferência",
  CREDITO:        "Crédito",
};

interface ReceiptItem {
  nomeProduto:   string;
  quantidade:    number;
  precoUnitario: number;
  taxaIva:       number;
  subtotal:      number;
}

interface ReceiptData {
  numeroVenda:     string;
  numeroFatura:    string;
  total:           number;
  subtotal:        number;
  totalDesconto:   number;
  totalIva:        number;
  metodoPagamento: string;
  clienteNome:     string | null;
  itens:           ReceiptItem[];
}

interface ReceiptModalProps {
  open:    boolean;
  onClose: () => void;
  data:    ReceiptData | null;
}

function fmt(n: unknown) {
  return Number(n ?? 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PosReceiptModal({ open, onClose, data }: ReceiptModalProps) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header verde */}
        <div className="bg-green-500 px-6 py-6 text-center text-white shrink-0">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold">Venda Concluída!</h2>
          <p className="text-green-100 text-xs mt-0.5">
            {METODO_LABEL[data.metodoPagamento] ?? data.metodoPagamento}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">

          <div className="px-5 pt-4 pb-2 border-b border-dashed border-gray-200">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="font-mono font-semibold text-gray-700">{data.numeroFatura}</span>
              <span className="font-mono">{new Date().toLocaleDateString("pt-MZ")}</span>
            </div>
            {data.clienteNome && (
              <p className="text-xs text-gray-500">Cliente: <span className="font-semibold text-gray-700">{data.clienteNome}</span></p>
            )}
          </div>

          {/* Itens */}
          <div className="px-5 py-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Itens</p>
            <div className="space-y-2">
              {(data.itens ?? []).map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[11px] font-bold font-mono text-gray-400 w-6 shrink-0 pt-0.5">
                    {item.quantidade}×
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 leading-tight">{item.nomeProduto}</p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {fmt(item.precoUnitario)} MT · IVA {Number(item.taxaIva ?? 0)}%
                    </p>
                  </div>

                  {/* Subtotal */}
                  <span className="text-xs font-bold text-gray-900 font-serif shrink-0">
                    {fmt(item.subtotal)} MT
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totais */}
          <div className="px-5 pb-4 border-t border-dashed border-gray-200 pt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span className="font-mono">{fmt(data.subtotal)} MT</span>
            </div>
            {Number(data.totalDesconto ?? 0) > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                <span>Desconto</span>
                <span className="font-mono">− {fmt(data.totalDesconto)} MT</span>
                </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
                <span>IVA</span>
                <span className="font-mono">{fmt(data.totalIva)} MT</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-green-600 font-serif">
                {fmt(data.total)} MT
                </span>
            </div>
            </div>
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex gap-3 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Nova Venda
          </button>
        </div>
      </div>
    </div>
  );
}
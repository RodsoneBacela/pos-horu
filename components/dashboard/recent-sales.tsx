import Link   from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetodoPagamento } from "../../lib/generated/prisma/client";

interface RecentSale {
  id:              string;
  numero:          string;
  total:           any;
  metodoPagamento: MetodoPagamento;
  clienteNome:     string | null;
  createdAt:       Date;
  itens:           { id: string }[];
}

interface RecentSalesProps {
  vendas: RecentSale[];
}

const payIcons: Record<MetodoPagamento, string> = {
  DINHEIRO:       "💵",
  MPESA:          "📱",
  EMOLA:          "📱",
  CARTAO_DEBITO:  "💳",
  CARTAO_CREDITO: "💳",
  TRANSFERENCIA:  "🏦",
  CREDITO:        "📋",
};

const payLabels: Record<MetodoPagamento, string> = {
  DINHEIRO:       "Dinheiro",
  MPESA:          "M-Pesa",
  EMOLA:          "e-Mola",
  CARTAO_DEBITO:  "Cartão",
  CARTAO_CREDITO: "Cartão",
  TRANSFERENCIA:  "Transf.",
  CREDITO:        "Crédito",
};

export function RecentSales({ vendas }: RecentSalesProps) {
  if (vendas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-gray-400">Nenhuma venda registada hoje</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {vendas.map((venda) => (
        <div
          key={venda.id}
          className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {/* Ícone pagamento */}
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-base flex-shrink-0">
            {payIcons[venda.metodoPagamento]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-600">
                {venda.numero}
              </span>
              <span className="text-xs text-gray-400">
                {venda.itens.length} {venda.itens.length === 1 ? "item" : "itens"}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">
              {venda.clienteNome ?? "Cliente Anónimo"} ·{" "}
              {payLabels[venda.metodoPagamento]}
            </p>
          </div>

          {/* Valor + hora */}
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-gray-900 font-serif">
              MT {Number(venda.total).toLocaleString("pt-MZ", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[10px] text-gray-400 font-mono">
              {new Date(venda.createdAt).toLocaleTimeString("pt-MZ", {
                hour:   "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}

      <Link
        href="/faturas"
        className="flex items-center justify-center gap-1.5 mt-1 text-xs font-semibold text-blue-600 hover:text-blue-700 py-1.5 transition-colors"
      >
        Ver todas as faturas <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
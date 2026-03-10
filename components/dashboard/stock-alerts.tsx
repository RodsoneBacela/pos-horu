import Link                  from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { cn }                from "@/lib/utils";

interface StockAlertItem {
  id:          string;
  nome:        string;
  stockActual: number;
  stockMinimo: number;
  categoria:   { nome: string };
}

interface StockAlertsProps {
  items: StockAlertItem[];
}

export function StockAlerts({ items }: StockAlertsProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-2">
          <span className="text-green-600 text-lg">✓</span>
        </div>
        <p className="text-sm font-medium text-gray-700">Stock em ordem</p>
        <p className="text-xs text-gray-400 mt-0.5">Nenhum produto abaixo do mínimo</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const esgotado = item.stockActual === 0;
        const pct = item.stockMinimo > 0
          ? Math.min(100, Math.round((item.stockActual / item.stockMinimo) * 100))
          : 0;

        return (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border text-sm",
              esgotado
                ? "bg-red-50   border-red-100"
                : "bg-amber-50 border-amber-100"
            )}
          >
            <AlertTriangle className={cn(
              "w-3.5 h-3.5 mt-0.5 flex-shrink-0",
              esgotado ? "text-red-500" : "text-amber-500"
            )} />

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{item.nome}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "text-xs font-mono font-bold",
                  esgotado ? "text-red-600" : "text-amber-600"
                )}>
                  {item.stockActual} un
                </span>
                <span className="text-xs text-gray-400">
                  / mín. {item.stockMinimo}
                </span>
              </div>
              {/* Barra de nível */}
              <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden w-full">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    esgotado ? "bg-red-400" : "bg-amber-400"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}

      <Link
        href="/stock"
        className="flex items-center justify-center gap-1.5 mt-1 text-xs font-semibold text-blue-600 hover:text-blue-700 py-1.5 transition-colors"
      >
        Ver todo o stock <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
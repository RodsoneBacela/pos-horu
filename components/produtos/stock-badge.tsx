import { cn } from "@/lib/utils";

interface StockBadgeProps {
  stockActual: number;
  stockMinimo: number;
}

export function StockBadge({ stockActual, stockMinimo }: StockBadgeProps) {
  const esgotado  = stockActual === 0;
  const baixo     = !esgotado && stockActual <= stockMinimo;
  const normal    = !esgotado && !baixo;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono border",
      esgotado && "bg-red-50   text-red-600   border-red-200",
      baixo    && "bg-amber-50 text-amber-700 border-amber-200",
      normal   && "bg-green-50 text-green-700 border-green-200",
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        esgotado && "bg-red-500",
        baixo    && "bg-amber-500",
        normal   && "bg-green-500",
      )} />
      {esgotado ? "Esgotado" : baixo ? "Stock Baixo" : "Disponível"}
    </span>
  );
}
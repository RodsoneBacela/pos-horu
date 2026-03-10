import { cn }         from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label:      string;
  value:      string;
  change?:    number;     // percentagem de variação
  changeLabel?: string;
  icon:       React.ReactNode;
  iconColor:  "blue" | "green" | "amber" | "purple" | "red";
}

const iconColors = {
  blue:   "bg-blue-50   text-blue-600",
  green:  "bg-green-50  text-green-600",
  amber:  "bg-amber-50  text-amber-600",
  purple: "bg-purple-50 text-purple-600",
  red:    "bg-red-50    text-red-600",
};

export function KpiCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  iconColor,
}: KpiCardProps) {
  const isUp      = change !== undefined && change > 0;
  const isDown    = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm hover:shadow-card transition-shadow">
      {/* Ícone */}
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center mb-3",
        iconColors[iconColor]
      )}>
        {icon}
      </div>

      {/* Label */}
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>

      {/* Valor */}
      <p className="text-2xl font-bold text-gray-900 tracking-tight font-serif">
        {value}
      </p>

      {/* Variação */}
      {(change !== undefined || changeLabel) && (
        <div className={cn(
          "flex items-center gap-1 mt-2 text-xs font-semibold font-mono",
          isUp      && "text-green-600",
          isDown    && "text-red-500",
          isNeutral && "text-gray-400",
        )}>
          {isUp   && <TrendingUp   className="w-3 h-3" />}
          {isDown && <TrendingDown className="w-3 h-3" />}
          {isNeutral && !changeLabel && <Minus className="w-3 h-3" />}

          <span>
            {change !== undefined && change !== 0
              ? `${isUp ? "+" : ""}${change.toFixed(1)}%`
              : ""
            }
            {changeLabel && ` ${changeLabel}`}
          </span>
        </div>
      )}
    </div>
  );
}
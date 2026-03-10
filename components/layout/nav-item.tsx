"use client";

import Link            from "next/link";
import { usePathname } from "next/navigation";
import { cn }          from "@/lib/utils";
import { NavItem as NavItemType } from "@/types/nav";

// Importa apenas os ícones necessários
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  FileText,
  Package,
  Boxes,
  ShoppingBag,
  Truck,
  BarChart3,
  Users,
  Settings,
  LucideIcon,
} from "lucide-react";

// Mapa de string → componente (fica no Client Component)
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  FileText,
  Package,
  Boxes,
  ShoppingBag,
  Truck,
  BarChart3,
  Users,
  Settings,
};

const badgeStyles = {
  default: "bg-gray-100 text-gray-600",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-green-100 text-green-700",
  danger:  "bg-red-500  text-white",
};

interface NavItemProps {
  item: NavItemType;
}

export function NavItem({ item }: NavItemProps) {
  const pathname = usePathname();
  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  // Resolve o ícone a partir da string
  const Icon = ICON_MAP[item.icon] ?? Package;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium",
        "transition-all duration-150 group border border-transparent",
        isActive
          ? "bg-blue-50 text-blue-700 border-blue-100"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 flex-shrink-0 transition-colors",
          isActive
            ? "text-blue-600"
            : "text-gray-400 group-hover:text-gray-600"
        )}
      />

      <span className="flex-1 truncate">{item.label}</span>

      {item.badge !== undefined && (
        <span
          className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono leading-none",
            badgeStyles[item.badgeVariant ?? "default"]
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
import { auth }         from "@/lib/auth";
import { logoutAction } from "@/actions/auth.actions";
import {
  Bell,
  Search,
  LogOut,
  ChevronRight,
  Store,
} from "lucide-react";

interface TopbarProps {
  title:       string;
  breadcrumbs?: { label: string; href?: string }[];
}

export async function Topbar({ title, breadcrumbs }: TopbarProps) {
  const session = await auth();

  return (
    <header className="h-14 bg-white border-b border-gray-150 flex items-center px-5 gap-4 flex-shrink-0">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        <span className="text-gray-400 flex items-center gap-1">
          <Store className="w-3.5 h-3.5" />
          HoruPOS
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
        {breadcrumbs?.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className={i === breadcrumbs.length - 1 ? "font-semibold text-gray-900" : "text-gray-400"}>
              {b.label}
            </span>
            {i < breadcrumbs.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            )}
          </span>
        )) ?? (
          <span className="font-semibold text-gray-900">{title}</span>
        )}
      </div>

      {/* Direita */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all">
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Notificações */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all">
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Logout */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 px-3 h-8 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </form>
      </div>
    </header>
  );
}
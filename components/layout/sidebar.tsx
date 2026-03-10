import Link   from "next/link";
import { cn } from "@/lib/utils";
import { NavItem }     from "@/components/layout/nav-item";
import { NAV_SECTIONS } from "@/config/nav.config";
import { Role }        from "../../lib/generated/prisma/client";

interface SidebarProps {
  userRole: Role;
  userName: string;
  userEmail: string;
}

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  // Iniciais do nome
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="w-[240px] min-w-[240px] h-screen bg-white border-r border-gray-150 flex flex-col overflow-hidden">

      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-gray-100 flex-shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-base leading-none">𓂀</span>
        </div>
        <div>
          <div className="font-bold text-gray-900 text-[17px] leading-tight tracking-tight">
            Horu<span className="text-blue-600">POS</span>
          </div>
          <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase leading-none">
            v1.0
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV_SECTIONS.map((section) => {
          // Filtra itens que o utilizador pode ver
          const visibleItems = section.items.filter(
            (item) => !item.roles || item.roles.includes(userRole)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label || "main"}>
              {section.label && (
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2.5 mb-1.5 font-mono">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {userName}
            </p>
            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wide leading-tight">
              {userRole}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
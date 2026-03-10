"use client";

import { useState }          from "react";
import { useRouter }         from "next/navigation";
import { Plus, Edit2, UserCheck, UserX, ShieldCheck, Shield, User } from "lucide-react";
import { cn }                from "@/lib/utils";
import { UtilizadorModal }   from "@/components/utilizadores/utilizador-modal";
import { toggleUtilizadorAction } from "@/actions/utilizador.actions";
import type { UtilizadorItem } from "@/lib/services/utilizador.service";

const ROLE_CONFIG: Record<string, { label: string; icon: any; cor: string }> = {
  ADMIN:   { label: "Administrador", icon: ShieldCheck, cor: "text-purple-700 bg-purple-50 border-purple-200" },
  GERENTE: { label: "Gerente",       icon: Shield,      cor: "text-blue-700 bg-blue-50 border-blue-200" },
  CAIXA:   { label: "Caixa",         icon: User,        cor: "text-green-700 bg-green-50 border-green-200" },
};

export function UtilizadoresClient({ utilizadores }: { utilizadores: UtilizadorItem[] }) {
  const router                           = useRouter();
  const [showModal, setShowModal]        = useState(false);
  const [editUser,  setEditUser]         = useState<UtilizadorItem | null>(null);

  async function handleToggle(u: UtilizadorItem) {
    if (!confirm(`${u.activo ? "Desactivar" : "Activar"} "${u.nome}"?`)) return;
    await toggleUtilizadorAction(u.id, !u.activo);
    router.refresh();
  }

  return (
    <>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Utilizadores</h1>
            <p className="text-sm text-gray-500 mt-0.5">{utilizadores.length} utilizador{utilizadores.length !== 1 ? "es" : ""} registado{utilizadores.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => { setEditUser(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Utilizador
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {utilizadores.map(u => {
            const role = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.CAIXA;
            const Icon = role.icon;

            return (
              <div
                key={u.id}
                className={cn(
                  "bg-white rounded-xl border border-gray-150 p-5 shadow-sm transition-all",
                  !u.activo && "opacity-60"
                )}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {u.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{u.nome}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">@{u.username}</p>
                  </div>
                  <span className={cn(
                    "shrink-0 w-2 h-2 rounded-full mt-1.5",
                    u.activo ? "bg-green-500" : "bg-gray-300"
                  )} />
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  <div className="flex items-center justify-between">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", role.cor)}>
                      <Icon className="w-3 h-3" />
                      {role.label}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{u.totalVendas} vendas</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">
                    Criado em {new Date(u.createdAt).toLocaleDateString("pt-MZ")}
                  </p>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => { setEditUser(u); setShowModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggle(u)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold transition-colors",
                      u.activo
                        ? "border border-red-200 text-red-600 hover:bg-red-50"
                        : "border border-green-200 text-green-700 hover:bg-green-50"
                    )}
                  >
                    {u.activo
                      ? <><UserX className="w-3 h-3" /> Desactivar</>
                      : <><UserCheck className="w-3 h-3" /> Activar</>
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <UtilizadorModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditUser(null); }}
        onSuccess={() => { router.refresh(); }}
        utilizador={editUser}
      />
    </>
  );
}
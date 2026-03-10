"use client";

import { useState }          from "react";
import { useRouter }         from "next/navigation";
import { Plus, Search, Edit2, UserX, UserCheck, Truck, Phone, Mail } from "lucide-react";
import { cn }                from "@/lib/utils";
import { FornecedorModal }   from "@/components/compras/fornecedor-modal";
import { toggleFornecedorAction } from "@/actions/compra.actions";
import type { FornecedorItem } from "@/lib/services/compras.service";

export function FornecedoresClient({ fornecedores, searchParams }: { fornecedores: FornecedorItem[]; searchParams: any }) {
  const router                             = useRouter();
  const [showModal, setShowModal]          = useState(false);
  const [editForn,  setEditForn]           = useState<FornecedorItem | null>(null);

  async function handleToggle(f: FornecedorItem) {
    if (!confirm(`${f.activo ? "Desactivar" : "Activar"} "${f.nome}"?`)) return;
    await toggleFornecedorAction(f.id, !f.activo);
    router.refresh();
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fornecedores</h1>
            <p className="text-sm text-gray-500 mt-0.5">{fornecedores.length} fornecedor{fornecedores.length !== 1 ? "es" : ""}</p>
          </div>
          <button
            onClick={() => { setEditForn(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo Fornecedor
          </button>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            defaultValue={searchParams.search ?? ""}
            onChange={e => router.push(`/fornecedores?search=${e.target.value}`)}
            placeholder="Pesquisar fornecedor..."
            className="pl-9 pr-4 h-9 w-full rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fornecedores.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-16 text-gray-400">
              <Truck className="w-10 h-10 mb-3" />
              <p className="font-semibold">Nenhum fornecedor encontrado</p>
            </div>
          ) : fornecedores.map(f => (
            <div key={f.id} className={cn("bg-white rounded-xl border border-gray-150 p-5 shadow-sm", !f.activo && "opacity-60")}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {f.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{f.nome}</p>
                  {f.nif && <p className="text-xs text-gray-400 font-mono">NIF: {f.nif}</p>}
                </div>
                <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", f.activo ? "bg-green-500" : "bg-gray-300")} />
              </div>

              <div className="space-y-1.5 mb-4">
                {f.telefone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {f.telefone}
                  </div>
                )}
                {f.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {f.email}
                  </div>
                )}
                {f.contacto && (
                  <p className="text-xs text-gray-400">Contacto: {f.contacto}</p>
                )}
                <p className="text-xs text-gray-400 font-mono">{f.totalCompras} compras registadas</p>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => { setEditForn(f); setShowModal(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Editar
                </button>
                <button
                  onClick={() => handleToggle(f)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold transition-colors",
                    f.activo ? "border border-red-200 text-red-600 hover:bg-red-50" : "border border-green-200 text-green-700 hover:bg-green-50"
                  )}
                >
                  {f.activo ? <><UserX className="w-3 h-3" /> Desactivar</> : <><UserCheck className="w-3 h-3" /> Activar</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FornecedorModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditForn(null); }}
        onSuccess={() => router.refresh()}
        fornecedor={editForn}
      />
    </>
  );
}
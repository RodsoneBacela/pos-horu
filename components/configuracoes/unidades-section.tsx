"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import { criarUnidadeAction, editarUnidadeAction, eliminarUnidadeAction } from "@/actions/configuracoes.actions";
import type { ConfigUnidade } from "@/lib/services/configuracoes.service";

function UnidadeModal({ unidade, onClose, onSuccess }: { unidade?: ConfigUnidade | null; onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ nome: unidade?.nome ?? "", abreviatura: unidade?.abreviatura ?? "", activo: unidade?.activo ?? true });
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit() {
    startTransition(async () => {
      const result = unidade
        ? await editarUnidadeAction(unidade.id, form)
        : await criarUnidadeAction(form);
      if (result?.error) setErro(result.error);
      else { onSuccess(); onClose(); }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{unidade ? "Editar Unidade" : "Nova Unidade"}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"><X className="w-3.5 h-3.5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Nome *</label>
            <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: Comprimido" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Abreviatura</label>
            <input value={form.abreviatura} onChange={e => setForm(f => ({ ...f, abreviatura: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: cp" />
          </div>
        </div>

        {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">⚠ {erro}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSubmit} disabled={isPending} className="flex-1 h-9 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export function UnidadesSection({ unidades, onSuccess }: { unidades: ConfigUnidade[]; onSuccess: () => void }) {
  const [modal,    setModal] = useState(false);
  const [editUn, setEdit]   = useState<ConfigUnidade | null>(null);

  async function handleDelete(u: ConfigUnidade) {
    if (!confirm(`Eliminar "${u.nome}"?`)) return;
    const result = await eliminarUnidadeAction(u.id);
    if (result?.error) alert(result.error);
    else onSuccess();
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Unidades de Medida</h3>
          <p className="text-xs text-gray-400 mt-0.5">Unidades usadas nos produtos</p>
        </div>
        <button onClick={() => { setEdit(null); setModal(true); }} className="flex items-center gap-2 px-3 h-8 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nova Unidade
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {unidades.map(u => (
          <div key={u.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-gray-500 font-mono">{u.abreviatura ?? u.nome.slice(0, 2)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-xs truncate">{u.nome}</p>
              {u.abreviatura && <p className="text-[10px] text-gray-400 font-mono">{u.abreviatura}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => { setEdit(u); setModal(true); }} className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Edit2 className="w-3 h-3" /></button>
              <button onClick={() => handleDelete(u)} className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && <UnidadeModal unidade={editUn} onClose={() => setModal(false)} onSuccess={onSuccess} />}
    </div>
  );
}
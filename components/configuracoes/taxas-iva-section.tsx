"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Star, Loader2, X } from "lucide-react";
import { cn }                      from "@/lib/utils";
import { criarTaxaIvaAction, editarTaxaIvaAction, eliminarTaxaIvaAction } from "@/actions/configuracoes.actions";
import type { ConfigTaxaIva }      from "@/lib/services/configuracoes.service";

function TaxaModal({ taxa, onClose, onSuccess }: { taxa?: ConfigTaxaIva | null; onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ nome: taxa?.nome ?? "", taxa: String(taxa?.taxa ?? "0"), padrao: taxa?.padrao ?? false, activo: taxa?.activo ?? true });
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit() {
    startTransition(async () => {
      const data = { nome: form.nome, taxa: parseFloat(form.taxa) || 0, padrao: form.padrao, activo: form.activo };
      const result = taxa
        ? await editarTaxaIvaAction(taxa.id, data)
        : await criarTaxaIvaAction(data);
      if (result?.error) setErro(result.error);
      else { onSuccess(); onClose(); }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{taxa ? "Editar Taxa" : "Nova Taxa IVA"}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"><X className="w-3.5 h-3.5" /></button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Nome *</label>
            <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: IVA Normal" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Taxa (%)</label>
            <input value={form.taxa} onChange={e => setForm(f => ({ ...f, taxa: e.target.value }))} type="number" min="0" max="100" step="0.01" className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="17" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.padrao} onChange={e => setForm(f => ({ ...f, padrao: e.target.checked }))} className="w-4 h-4 rounded accent-blue-600" />
            <span className="text-sm text-gray-700">Taxa padrão</span>
          </label>
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

export function TaxasIvaSection({ taxas, onSuccess }: { taxas: ConfigTaxaIva[]; onSuccess: () => void }) {
  const [modal,  setModal]  = useState(false);
  const [editTaxa, setEdit] = useState<ConfigTaxaIva | null>(null);

  async function handleDelete(t: ConfigTaxaIva) {
    if (!confirm(`Eliminar "${t.nome}"?`)) return;
    const result = await eliminarTaxaIvaAction(t.id);
    if (result?.error) alert(result.error);
    else onSuccess();
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Taxas de IVA</h3>
          <p className="text-xs text-gray-400 mt-0.5">Configurar as taxas aplicáveis aos produtos</p>
        </div>
        <button onClick={() => { setEdit(null); setModal(true); }} className="flex items-center gap-2 px-3 h-8 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nova Taxa
        </button>
      </div>

      <div className="space-y-2">
        {taxas.map(t => (
          <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-blue-600 font-mono">{t.taxa}%</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 text-sm">{t.nome}</p>
                {t.padrao && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full"><Star className="w-2.5 h-2.5" />Padrão</span>}
                {!t.activo && <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Inactivo</span>}
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Taxa: {t.taxa}%</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEdit(t); setModal(true); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(t)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && <TaxaModal taxa={editTaxa} onClose={() => setModal(false)} onSuccess={onSuccess} />}
    </div>
  );
}
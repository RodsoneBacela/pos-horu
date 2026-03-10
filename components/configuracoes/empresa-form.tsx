"use client";

import { useState, useTransition } from "react";
import { Loader2, Save }           from "lucide-react";
import { cn }                      from "@/lib/utils";
import { salvarEmpresaAction }     from "@/actions/configuracoes.actions";
import type { ConfigEmpresa }      from "@/lib/services/configuracoes.service";

const TIPOS_NEGOCIO = [
  "FARMACIA", "RESTAURANTE", "BAR", "LOJA", "SUPERMERCADO",
  "CLINICA", "HOTEL", "OUTRO",
];

export function EmpresaForm({ empresa, onSuccess }: { empresa: ConfigEmpresa | null; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [erro,      setErro]         = useState<string | null>(null);
  const [ok,        setOk]           = useState(false);

  const [form, setForm] = useState({
    nome:        empresa?.nome        ?? "",
    nif:         empresa?.nif         ?? "",
    endereco:    empresa?.endereco    ?? "",
    telefone:    empresa?.telefone    ?? "",
    email:       empresa?.email       ?? "",
    website:     empresa?.website     ?? "",
    moeda:       empresa?.moeda       ?? "MT",
    timezone:    empresa?.timezone    ?? "Africa/Maputo",
    tipoNegocio: empresa?.tipoNegocio ?? "FARMACIA",
  });

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    setOk(false);
  }

  function handleSubmit() {
    setErro(null); setOk(false);
    startTransition(async () => {
      const result = await salvarEmpresaAction(form);
      if (result?.error) setErro(result.error);
      else { setOk(true); onSuccess(); }
    });
  }

  const inp = cn("w-full h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent");
  const sel = cn("w-full h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-bold text-gray-900">Dados da Empresa</h3>
        <p className="text-xs text-gray-400 mt-0.5">Informações que aparecem nas faturas</p>
      </div>

      <div className="grid grid-cols-2 gap-4">

        {/* Nome */}
        <div className="col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Nome da Empresa *</label>
          <input value={form.nome} onChange={e => set("nome", e.target.value)} className={inp} placeholder="HoruPOS Demo" />
        </div>

        {/* NIF + Telefone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">NIF</label>
          <input value={form.nif} onChange={e => set("nif", e.target.value)} className={inp} placeholder="400012345" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Telefone</label>
          <input value={form.telefone} onChange={e => set("telefone", e.target.value)} className={inp} placeholder="+258 84 000 0000" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Email</label>
          <input value={form.email} onChange={e => set("email", e.target.value)} type="email" className={inp} placeholder="empresa@email.com" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Website</label>
          <input value={form.website} onChange={e => set("website", e.target.value)} className={inp} placeholder="www.empresa.co.mz" />
        </div>

        <div className="col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Endereço</label>
          <input value={form.endereco} onChange={e => set("endereco", e.target.value)} className={inp} placeholder="Av. 25 de Setembro, Maputo" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Moeda</label>
          <select value={form.moeda} onChange={e => set("moeda", e.target.value)} className={sel}>
            <option value="MT">MT — Metical</option>
            <option value="USD">USD — Dólar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="ZAR">ZAR — Rand</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Tipo de Negócio</label>
          <select value={form.tipoNegocio} onChange={e => set("tipoNegocio", e.target.value)} className={sel}>
            {TIPOS_NEGOCIO.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">⚠ {erro}</p>}
      {ok   && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">✓ Dados guardados com sucesso</p>}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex items-center gap-2 px-5 h-9 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {isPending ? "A guardar..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
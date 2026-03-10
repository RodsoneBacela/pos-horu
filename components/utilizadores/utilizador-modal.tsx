"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Loader2, Eye, EyeOff }            from "lucide-react";
import { cn }                                  from "@/lib/utils";
import { criarUtilizadorAction, editarUtilizadorAction } from "@/actions/utilizador.actions";
import type { UtilizadorItem } from "@/lib/services/utilizador.service";

const ROLES = [
  { value: "ADMIN",   label: "Administrador", desc: "Acesso total ao sistema",         cor: "text-purple-700 bg-purple-50 border-purple-200" },
  { value: "GERENTE", label: "Gerente",        desc: "Gestão de produtos e relatórios", cor: "text-blue-700 bg-blue-50 border-blue-200" },
  { value: "CAIXA",   label: "Caixa",          desc: "Apenas vendas e caixa",           cor: "text-green-700 bg-green-50 border-green-200" },
];

interface UtilizadorModalProps {
  open:        boolean;
  onClose:     () => void;
  onSuccess:   () => void;
  utilizador?: UtilizadorItem | null;
}

export function UtilizadorModal({ open, onClose, onSuccess, utilizador }: UtilizadorModalProps) {
  const [isPending, startTransition] = useTransition();
  const [erro,      setErro]         = useState<string | null>(null);
  const [showPass,  setShowPass]     = useState(false);
  const isEdit = !!utilizador;

  const [form, setForm] = useState({
    nome: "", email: "", username: "", password: "",
    role: "CAIXA" as "ADMIN" | "GERENTE" | "CAIXA",
    activo: true,
  });

  useEffect(() => {
    if (open) {
      setErro(null);
      setShowPass(false);
      if (utilizador) {
        setForm({
          nome:     utilizador.nome,
          email:    utilizador.email,
          username: utilizador.username,
          password: "",
          role:     utilizador.role as any,
          activo:   utilizador.activo,
        });
      } else {
        setForm({ nome: "", email: "", username: "", password: "", role: "CAIXA", activo: true });
      }
    }
  }, [open, utilizador]);

  function set(key: string, value: any) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    setErro(null);
    startTransition(async () => {
      const result = isEdit
        ? await editarUtilizadorAction(utilizador!.id, form)
        : await criarUtilizadorAction(form);

      if (result?.error) setErro(result.error);
      else { onSuccess(); onClose(); }
    });
  }

  if (!open) return null;

  const inputCls = (err = false) => cn(
    "w-full h-9 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
    err ? "border-red-300" : "border-gray-200"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? "Editar Utilizador" : "Novo Utilizador"}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Nome completo *</label>
            <input
              value={form.nome}
              onChange={e => set("nome", e.target.value)}
              className={inputCls()}
              placeholder="ex: João Silva"
            />
          </div>

          {/* Email + Username */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Email *</label>
              <input
                value={form.email}
                onChange={e => set("email", e.target.value)}
                type="email"
                className={inputCls()}
                placeholder="joao@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Username *</label>
              <input
                value={form.username}
                onChange={e => set("username", e.target.value.toLowerCase())}
                className={inputCls()}
                placeholder="joao_silva"
                disabled={isEdit}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Password {isEdit ? "(deixar vazio para não alterar)" : "*"}
            </label>
            <div className="relative">
              <input
                value={form.password}
                onChange={e => set("password", e.target.value)}
                type={showPass ? "text" : "password"}
                className={cn(inputCls(), "pr-9")}
                placeholder={isEdit ? "••••••" : "mínimo 6 caracteres"}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Perfil *</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => set("role", r.value)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all",
                    form.role === r.value ? r.cor + " border-current" : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <p className="text-xs font-bold">{r.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Activo */}
          {isEdit && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Conta activa</p>
                <p className="text-xs text-gray-400">Utilizador consegue fazer login</p>
              </div>
              <button
                type="button"
                onClick={() => set("activo", !form.activo)}
                className={cn(
                  "w-11 h-6 rounded-full transition-all relative",
                  form.activo ? "bg-green-500" : "bg-gray-300"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
                  form.activo ? "left-5" : "left-0.5"
                )} />
              </button>
            </div>
          )}

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠ {erro}
            </p>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isPending ? "A guardar..." : isEdit ? "Actualizar" : "Criar Utilizador"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
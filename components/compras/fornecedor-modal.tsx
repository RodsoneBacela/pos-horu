"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Loader2 }                         from "lucide-react";
import { criarFornecedorAction, editarFornecedorAction } from "@/actions/compra.actions";
import type { FornecedorItem } from "@/lib/services/compras.service";

interface FornecedorModalProps {
  open:         boolean;
  onClose:      () => void;
  onSuccess:    () => void;
  fornecedor?:  FornecedorItem | null;
}

export function FornecedorModal({ open, onClose, onSuccess, fornecedor }: FornecedorModalProps) {
  const [isPending, startTransition] = useTransition();
  const [erro,      setErro]         = useState<string | null>(null);
  const isEdit = !!fornecedor;

  const [form, setForm] = useState({
    nome: "", nif: "", telefone: "", email: "",
    endereco: "", contacto: "", activo: true,
  });

  useEffect(() => {
    if (open) {
      setErro(null);
      setForm(fornecedor ? {
        nome:     fornecedor.nome,
        nif:      fornecedor.nif      ?? "",
        telefone: fornecedor.telefone ?? "",
        email:    fornecedor.email    ?? "",
        endereco: fornecedor.endereco ?? "",
        contacto: fornecedor.contacto ?? "",
        activo:   fornecedor.activo,
      } : { nome: "", nif: "", telefone: "", email: "", endereco: "", contacto: "", activo: true });
    }
  }, [open, fornecedor]);

  function set(key: string, value: any) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    setErro(null);
    startTransition(async () => {
      const result = isEdit
        ? await editarFornecedorAction(fornecedor!.id, form)
        : await criarFornecedorAction(form);
      if (result?.error) setErro(result.error);
      else { onSuccess(); onClose(); }
    });
  }

  if (!open) return null;

  const inp = "w-full h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? "Editar Fornecedor" : "Novo Fornecedor"}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Nome *</label>
            <input value={form.nome} onChange={e => set("nome", e.target.value)} className={inp} placeholder="ex: Pharmaq Moçambique" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">NUIT</label>
              <input value={form.nif} onChange={e => set("nif", e.target.value)} className={inp} placeholder="400012345" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Telefone</label>
              <input value={form.telefone} onChange={e => set("telefone", e.target.value)} className={inp} placeholder="+258 84 000 0000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Email</label>
              <input value={form.email} onChange={e => set("email", e.target.value)} type="email" className={inp} placeholder="fornecedor@email.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Contacto</label>
              <input value={form.contacto} onChange={e => set("contacto", e.target.value)} className={inp} placeholder="Nome do responsável" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Endereço</label>
            <input value={form.endereco} onChange={e => set("endereco", e.target.value)} className={inp} placeholder="Rua, Cidade" />
          </div>

          {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">⚠ {erro}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={isPending} className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isPending ? "A guardar..." : isEdit ? "Actualizar" : "Criar Fornecedor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
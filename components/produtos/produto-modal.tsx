"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm }       from "react-hook-form";
import { zodResolver }   from "@hookform/resolvers/zod";
import { X, Loader2 }   from "lucide-react";
import { cn }           from "@/lib/utils";
import { produtoSchema, type ProdutoInput } from "@/lib/validations/produto.schema";
import { criarProdutoAction, editarProdutoAction } from "@/actions/produto.actions";

interface Categoria { id: string; nome: string; cor: string }
interface Unidade   { id: string; nome: string; abreviatura: string }
interface TaxaIva   { id: string; nome: string; taxa: number }

interface ProdutoModalProps {
  open:       boolean;
  onClose:    () => void;
  onSuccess:  () => void;
  categorias: Categoria[];
  unidades:   Unidade[];
  taxasIva:   TaxaIva[];
  produto?:   Partial<ProdutoInput> & { id?: string } | null;
}

type FormValues = {
  nome:         string;
  codigo:       string;
  codigoBarras?: string | null;
  categoriaId:  string;
  unidadeId:    string;
  taxaIvaId:    string;
  precoCompra:  number;
  precoVenda:   number;
  stockActual:  number;
  stockMinimo:  number;
  stockMaximo?: number | null;
  fabricante?:  string | null;
  validade?:    Date | null;
  lote?:        string | null;
  descricao?:   string | null;
  activo:       boolean;
};

export function ProdutoModal({
  open, onClose, onSuccess,
  categorias, unidades, taxasIva,
  produto,
}: ProdutoModalProps) {
  const [isPending,   startTransition] = useTransition();
  const [serverError, setServerError]  = useState<string | null>(null);
  const isEdit = !!produto?.id;

  const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm<FormValues>({
  resolver: zodResolver(produtoSchema) as any,
});

  useEffect(() => {
    if (open) {
      setServerError(null);
      if (produto) {
        reset({
          ...produto,
          precoCompra: produto.precoCompra ?? 0,
          precoVenda:  produto.precoVenda  ?? 0,
          stockActual: produto.stockActual ?? 0,
          stockMinimo: produto.stockMinimo ?? 0,
          activo:      produto.activo      ?? true,
        });
      } else {
        reset({
          activo:      true,
          stockActual: 0,
          stockMinimo: 0,
          precoCompra: 0,
          precoVenda:  0,
        });
      }
    }
  }, [open, produto, reset]);

  function onSubmit(data: FormValues) {
  setServerError(null);
  startTransition(async () => {
    const result = isEdit && produto?.id
      ? await editarProdutoAction(produto.id, data as ProdutoInput)
      : await criarProdutoAction(data as ProdutoInput);

    if (result?.error) {
      setServerError(result.error);
    } else {
      onSuccess();
      onClose();
    }
  });
}

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? "Editar Produto" : "Novo Produto"}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              ⚠ {serverError}
            </div>
          )}

          <form id="produto-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-5">

              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Nome do Produto *</label>
                <input {...register("nome")} className={inputCls(!!errors.nome)} placeholder="ex: Paracetamol 500mg" />
                {errors.nome && <p className="text-xs text-red-500">{errors.nome.message}</p>}
              </div>

              {/* Código + Barras */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Código *</label>
                  <input {...register("codigo")} className={inputCls(!!errors.codigo)} placeholder="ex: MED001" />
                  {errors.codigo && <p className="text-xs text-red-500">{errors.codigo.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Código de Barras</label>
                  <input {...register("codigoBarras")} className={inputCls(false)} placeholder="ex: 5601234567890" />
                </div>
              </div>

              {/* Categoria + Unidade + IVA */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Categoria *</label>
                  <select {...register("categoriaId")} className={selectCls(!!errors.categoriaId)}>
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  {errors.categoriaId && <p className="text-xs text-red-500">{errors.categoriaId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Unidade *</label>
                  <select {...register("unidadeId")} className={selectCls(!!errors.unidadeId)}>
                    <option value="">Seleccionar...</option>
                    {unidades.map(u => <option key={u.id} value={u.id}>{u.nome} ({u.abreviatura})</option>)}
                  </select>
                  {errors.unidadeId && <p className="text-xs text-red-500">{errors.unidadeId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Taxa IVA *</label>
                  <select {...register("taxaIvaId")} className={selectCls(!!errors.taxaIvaId)}>
                    <option value="">Seleccionar...</option>
                    {taxasIva.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.taxa}%)</option>)}
                  </select>
                  {errors.taxaIvaId && <p className="text-xs text-red-500">{errors.taxaIvaId.message}</p>}
                </div>
              </div>

              {/* Preços */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Preço de Compra (MT) *</label>
                  <input {...register("precoCompra")} type="number" step="0.01" min="0" className={inputCls(!!errors.precoCompra)} placeholder="0.00" />
                  {errors.precoCompra && <p className="text-xs text-red-500">{errors.precoCompra.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Preço de Venda (MT) *</label>
                  <input {...register("precoVenda")} type="number" step="0.01" min="0" className={inputCls(!!errors.precoVenda)} placeholder="0.00" />
                  {errors.precoVenda && <p className="text-xs text-red-500">{errors.precoVenda.message}</p>}
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Stock Inicial</label>
                  <input {...register("stockActual")} type="number" min="0" className={inputCls(false)} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Stock Mínimo</label>
                  <input {...register("stockMinimo")} type="number" min="0" className={inputCls(false)} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Stock Máximo</label>
                  <input {...register("stockMaximo")} type="number" min="0" className={inputCls(false)} placeholder="opcional" />
                </div>
              </div>

              {/* Validade + Lote + Fabricante */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Data de Validade</label>
                  <input {...register("validade")} type="date" className={inputCls(false)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Lote</label>
                  <input {...register("lote")} className={inputCls(false)} placeholder="ex: L2025001" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Fabricante</label>
                  <input {...register("fabricante")} className={inputCls(false)} placeholder="ex: Pharmaq" />
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button type="button" onClick={onClose} className="px-4 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button type="submit" form="produto-form" disabled={isPending} className="px-5 h-9 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2 transition-colors">
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isPending ? "A guardar..." : isEdit ? "Actualizar" : "Criar Produto"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls  = (err: boolean) => cn("w-full h-9 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all", err ? "border-red-300" : "border-gray-200");
const selectCls = (err: boolean) => cn("w-full h-9 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all", err ? "border-red-300" : "border-gray-200");
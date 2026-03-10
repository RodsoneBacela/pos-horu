"use client";

import { useTransition }     from "react";
import { Minus, Plus, X, ShoppingCart, CheckCircle, Loader2 } from "lucide-react";
import { cn }                from "@/lib/utils";
import { useCartStore }      from "@/stores/cart.store";
import { criarVendaAction }  from "@/actions/venda.actions";

const METODOS = [
  { value: "DINHEIRO",       label: "Dinheiro",  icon: "💵" },
  { value: "MPESA",          label: "M-Pesa",    icon: "📱" },
  { value: "EMOLA",          label: "e-Mola",    icon: "📱" },
  { value: "CARTAO_DEBITO",  label: "Cartão",    icon: "💳" },
  { value: "TRANSFERENCIA",  label: "Transf.",   icon: "🏦" },
  { value: "CREDITO",        label: "Crédito",   icon: "📋" },
];

interface PosCartProps {
  caixaId:   string;
  onSuccess: (result: any) => void;   // ← any para aceitar o objecto completo
  onError:   (msg: string) => void;
}

export function PosCart({ caixaId, onSuccess, onError }: PosCartProps) {
  const [isPending, startTransition] = useTransition();

  const {
    items, desconto, metodoPagamento, clienteNome, clienteNif,
    addItem, removeItem, updateQty,
    setDesconto, setMetodo, setClienteNome, setClienteNif, clearCart,
    subtotal, totalDesconto, totalIva, total,
  } = useCartStore();

  const sub  = subtotal();
  const desc = totalDesconto();
  const iva  = totalIva();
  const tot  = total();
  const nItens = items.reduce((s, i) => s + i.quantidade, 0);

  function handleCheckout() {
  if (!items.length) return;

  startTransition(async () => {
    const payload = {
      itens: items.map(i => ({
        produtoId:     i.produtoId,
        nomeProduto:   i.nomeProduto,
        quantidade:    i.quantidade,
        precoUnitario: i.precoUnitario,
        taxaIva:       i.taxaIva,
        desconto:      0,
        subtotal:      i.subtotal,
      })),
      metodoPagamento: metodoPagamento as any,
      clienteNome:     clienteNome || null,
      clienteNif:      clienteNif  || null,
      desconto,
      caixaId,
    };

    const result = await criarVendaAction(payload);

    if (result.error) {
      onError(result.error);
    } else if (result.success) {
      clearCart();
      onSuccess(result);
    }
  });
}

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-gray-400" />
          <span className="font-bold text-gray-900 text-sm">Carrinho</span>
        </div>
        {nItens > 0 && (
          <span className="text-[10px] font-bold font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
            {nItens} {nItens === 1 ? "item" : "itens"}
          </span>
        )}
      </div>

      {/* Itens */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <ShoppingCart className="w-10 h-10 text-gray-200 mb-2" />
            <p className="text-sm font-medium text-gray-400">Carrinho vazio</p>
            <p className="text-xs text-gray-300 mt-0.5">Clique num produto para adicionar</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {items.map(item => (
              <div
                key={item.produtoId}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{item.nomeProduto}</p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    MT {item.precoUnitario.toFixed(2)} / un
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => updateQty(item.produtoId, item.quantidade - 1)}
                    className="w-5 h-5 rounded-md bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs font-bold w-5 text-center font-mono">
                    {item.quantidade}
                  </span>
                  <button
                    onClick={() => updateQty(item.produtoId, item.quantidade + 1)}
                    disabled={item.quantidade >= item.stockMax}
                    className="w-5 h-5 rounded-md bg-gray-100 hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Subtotal */}
                <span className="text-xs font-bold text-gray-900 font-serif w-16 text-right flex-shrink-0">
                  MT {item.subtotal.toFixed(2)}
                </span>

                {/* Remover */}
                <button
                  onClick={() => removeItem(item.produtoId)}
                  className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-4 space-y-3 flex-shrink-0">

        {/* Totais */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span>
            <span className="font-mono">MT {sub.toFixed(2)}</span>
          </div>
          {desc > 0 && (
            <div className="flex justify-between text-xs text-green-600">
              <span>Desconto ({desconto}%)</span>
              <span className="font-mono">− MT {desc.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-500">
            <span>IVA</span>
            <span className="font-mono">MT {iva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5 border-t border-gray-100">
            <span>Total</span>
            <span className="text-blue-600 font-serif text-base">
              MT {tot.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Método de pagamento */}
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2 font-mono">
            Pagamento
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {METODOS.map(m => (
              <button
                key={m.value}
                onClick={() => setMetodo(m.value)}
                className={cn(
                  "py-2 px-1 rounded-lg border text-center transition-all",
                  metodoPagamento === m.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className="text-base leading-none mb-0.5">{m.icon}</div>
                <div className={cn(
                  "text-[10px] font-semibold leading-none",
                  metodoPagamento === m.value ? "text-blue-700" : "text-gray-600"
                )}>
                  {m.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cliente */}
        <div className="grid grid-cols-2 gap-2">
          <input
            value={clienteNome}
            onChange={e => setClienteNome(e.target.value)}
            placeholder="Cliente (opcional)"
            className="h-8 px-3 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            value={desconto === 0 ? "" : String(desconto)}
            onChange={e => setDesconto(Number(e.target.value) || 0)}
            placeholder="Desconto %"
            type="number" min="0" max="100"
            className="h-8 px-3 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Botão finalizar */}
        <button
          onClick={handleCheckout}
          disabled={items.length === 0 || isPending}
          className={cn(
            "w-full h-11 rounded-xl text-sm font-bold transition-all",
            "flex items-center justify-center gap-2",
            items.length > 0 && !isPending
              ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> A processar...</>
          ) : (
            <><CheckCircle className="w-4 h-4" /> Finalizar Venda · MT {tot.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}</>
          )}
        </button>
      </div>
    </div>
  );
}
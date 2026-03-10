import { create } from "zustand";
import { ProdutoPOS } from "@/lib/services/pos.service";

export interface CartItem {
  produtoId:     string;
  nomeProduto:   string;
  precoUnitario: number;
  taxaIva:       number;
  quantidade:    number;
  stockMax:      number;
  subtotal:      number;
}

interface CartStore {
  items:           CartItem[];
  desconto:        number;
  metodoPagamento: string;
  clienteNome:     string;
  clienteNif:      string;

  // Acções
  addItem:         (produto: ProdutoPOS) => void;
  removeItem:      (produtoId: string) => void;
  updateQty:       (produtoId: string, qty: number) => void;
  setDesconto:     (v: number) => void;
  setMetodo:       (v: string) => void;
  setClienteNome:  (v: string) => void;
  setClienteNif:   (v: string) => void;
  clearCart:       () => void;

  // Calculados
  subtotal:        () => number;
  totalDesconto:   () => number;
  totalIva:        () => number;
  total:           () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items:           [],
  desconto:        0,
  metodoPagamento: "DINHEIRO",
  clienteNome:     "",
  clienteNif:      "",

  addItem(produto) {
    const { items } = get();
    const existe = items.find(i => i.produtoId === produto.id);

    if (existe) {
      if (existe.quantidade >= produto.stockActual) return; 
      set({
        items: items.map(i =>
          i.produtoId === produto.id
            ? { ...i, quantidade: i.quantidade + 1, subtotal: (i.quantidade + 1) * i.precoUnitario }
            : i
        ),
      });
    } else {
      set({
        items: [...items, {
          produtoId:     produto.id,
          nomeProduto:   produto.nome,
          precoUnitario: produto.precoVenda,
          taxaIva:       produto.taxaIva,
          quantidade:    1,
          stockMax:      produto.stockActual,
          subtotal:      produto.precoVenda,
        }],
      });
    }
  },

  removeItem(produtoId) {
    set({ items: get().items.filter(i => i.produtoId !== produtoId) });
  },

  updateQty(produtoId, qty) {
    if (qty <= 0) {
      get().removeItem(produtoId);
      return;
    }
    set({
      items: get().items.map(i =>
        i.produtoId === produtoId
          ? { ...i, quantidade: Math.min(qty, i.stockMax), subtotal: Math.min(qty, i.stockMax) * i.precoUnitario }
          : i
      ),
    });
  },

  setDesconto:    (v) => set({ desconto:        Math.min(100, Math.max(0, v)) }),
  setMetodo:      (v) => set({ metodoPagamento: v }),
  setClienteNome: (v) => set({ clienteNome:     v }),
  setClienteNif:  (v) => set({ clienteNif:      v }),
  clearCart:      ()  => set({ items: [], desconto: 0, clienteNome: "", clienteNif: "" }),

  subtotal()      { return get().items.reduce((s, i) => s + i.subtotal, 0); },
  totalDesconto() { return get().subtotal() * (get().desconto / 100); },
  totalIva()      {
    const desc = get().desconto / 100;
    return get().items.reduce((s, i) => {
      const base = i.subtotal * (1 - desc);
      return s + base * (i.taxaIva / 100);
    }, 0);
  },
  total()         { return get().subtotal() - get().totalDesconto() + get().totalIva(); },
}));
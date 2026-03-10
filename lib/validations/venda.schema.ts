import { z } from "zod";

export const vendaItemSchema = z.object({
  produtoId:    z.string().min(1),
  nomeProduto:  z.string(),
  quantidade:   z.number().int().min(1),
  precoUnitario: z.number().min(0),
  taxaIva:      z.number().min(0),
  desconto:     z.number().min(0).max(100).default(0),
  subtotal:     z.number().min(0),
});

export const criarVendaSchema = z.object({
  itens:           z.array(vendaItemSchema).min(1, "Carrinho vazio"),
  metodoPagamento: z.enum([
    "DINHEIRO", "MPESA", "EMOLA",
    "CARTAO_DEBITO", "CARTAO_CREDITO",
    "TRANSFERENCIA", "CREDITO",
  ]),
  clienteNome:  z.string().max(100).optional().nullable(),
  clienteNif:   z.string().max(20).optional().nullable(),
  desconto:     z.number().min(0).max(100).default(0),
  caixaId:      z.string().min(1, "Caixa não encontrada"),
  observacoes:  z.string().max(300).optional().nullable(),
});

export type CriarVendaInput = z.infer<typeof criarVendaSchema>;
export type VendaItemInput  = z.infer<typeof vendaItemSchema>;
import { z } from "zod";

export const fornecedorSchema = z.object({
  nome:     z.string().min(2, "Nome obrigatório"),
  nif:      z.string().max(20).optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  email:    z.string().email().optional().nullable().or(z.literal("")),
  endereco: z.string().max(200).optional().nullable(),
  contacto: z.string().max(100).optional().nullable(),
  activo:   z.boolean().default(true),
});

export const compraItemSchema = z.object({
  produtoId:   z.string().min(1),
  nomeProduto: z.string(),
  quantidade:  z.coerce.number().int().min(1),
  precoUnit:   z.coerce.number().min(0),
  subtotal:    z.coerce.number().min(0),
  lote:        z.string().optional().nullable(),
  validade:    z.coerce.date().optional().nullable(),
});

export const criarCompraSchema = z.object({
  fornecedorId: z.string().min(1, "Fornecedor obrigatório"),
  nrFactura:    z.string().max(50).optional().nullable(),
  observacoes:  z.string().max(300).optional().nullable(),
  itens:        z.array(compraItemSchema).min(1, "Adiciona pelo menos um produto"),
});

export type FornecedorInput = z.infer<typeof fornecedorSchema>;
export type CriarCompraInput = z.infer<typeof criarCompraSchema>;
import { z } from "zod";

export const produtoSchema = z.object({
  nome:        z.string().min(2, "Nome obrigatório").max(150),
  codigo:      z.string().min(1, "Código obrigatório").max(50),
  codigoBarras:z.string().max(50).optional().nullable(),
  categoriaId: z.string().min(1, "Categoria obrigatória"),
  unidadeId:   z.string().min(1, "Unidade obrigatória"),
  taxaIvaId:   z.string().min(1, "Taxa IVA obrigatória"),
  precoCompra: z.coerce.number().min(0, "Preço inválido"),
  precoVenda:  z.coerce.number().min(0.01, "Preço de venda obrigatório"),
  stockActual: z.coerce.number().int().min(0).default(0),
  stockMinimo: z.coerce.number().int().min(0).default(0),
  stockMaximo: z.coerce.number().int().min(0).optional().nullable(),
  fabricante:  z.string().max(100).optional().nullable(),
  validade:    z.coerce.date().optional().nullable(),
  lote:        z.string().max(50).optional().nullable(),
  descricao:   z.string().max(500).optional().nullable(),
  activo:      z.boolean().default(true),
});

export const ajusteStockSchema = z.object({
  produtoId:  z.string().min(1),
  tipo:       z.enum(["AJUSTE_POSITIVO", "AJUSTE_NEGATIVO"]),
  quantidade: z.coerce.number().int().min(1, "Quantidade mínima é 1"),
  motivo:     z.string().min(3, "Motivo obrigatório").max(200),
});

export type ProdutoInput     = z.infer<typeof produtoSchema>;
export type AjusteStockInput = z.infer<typeof ajusteStockSchema>;
import { z } from "zod";

export const criarUtilizadorSchema = z.object({
  nome:     z.string().min(2, "Nome obrigatório"),
  email:    z.string().email("Email inválido"),
  username: z.string().min(3, "Username mínimo 3 caracteres").max(30)
             .regex(/^[a-z0-9_]+$/, "Apenas letras minúsculas, números e _"),
  password: z.string().min(6, "Password mínimo 6 caracteres"),
  role:     z.enum(["ADMIN", "GERENTE", "CAIXA"]),
  activo:   z.boolean().default(true),
});

export const editarUtilizadorSchema = z.object({
  nome:   z.string().min(2, "Nome obrigatório"),
  email:  z.string().email("Email inválido"),
  role:   z.enum(["ADMIN", "GERENTE", "CAIXA"]),
  activo: z.boolean().default(true),
  // Password opcional na edição
  password: z.string().min(6).optional().or(z.literal("")),
});

export type CriarUtilizadorInput  = z.infer<typeof criarUtilizadorSchema>;
export type EditarUtilizadorInput = z.infer<typeof editarUtilizadorSchema>;
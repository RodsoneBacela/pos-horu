import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email ou username é obrigatório")
    .max(100, "Demasiado longo"),
  password: z
    .string()
    .min(1, "Password é obrigatória")
    .max(100, "Demasiado longo"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100),
  email: z
    .string()
    .email("Email inválido")
    .toLowerCase(),
  username: z
    .string()
    .min(3, "Username deve ter pelo menos 3 caracteres")
    .max(30)
    .regex(/^[a-z0-9._-]+$/, "Username só pode ter letras, números, . _ -")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password deve ter pelo menos 8 caracteres")
    .max(100),
  role: z.enum(["ADMIN", "GERENTE", "CAIXA"]).default("CAIXA"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ password: true })
  .extend({
    password: z
      .string()
      .min(8)
      .max(100)
      .optional()
      .or(z.literal("")),
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
"use server";

import { signIn, signOut } from "@/lib/auth";
import { loginSchema }     from "@/lib/validations/auth.schema";
import { AuthError }       from "next-auth";
import { redirect }        from "next/navigation";

export async function loginAction(formData: unknown) {
  // 1. Validar
  const validated = loginSchema.safeParse(formData);
  if (!validated.success) {
    return {
      error: "Dados inválidos. Verifica o email/username e password.",
    };
  }

  try {
    await signIn("credentials", {
      identifier: validated.data.identifier,
      password:   validated.data.password,
      redirect:   false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email/username ou password incorrectos." };
        default:
          return { error: "Erro de autenticação. Tenta novamente." };
      }
    }
    throw error;
  }

  redirect("/");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
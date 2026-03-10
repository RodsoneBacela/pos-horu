"use server";

import { revalidatePath } from "next/cache";
import { auth }           from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import bcrypt             from "bcryptjs";
import {
  criarUtilizadorSchema,
  editarUtilizadorSchema,
} from "@/lib/validations/utilizador.schema";

export async function criarUtilizadorAction(formData: unknown) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão" };

  const validated = criarUtilizadorSchema.safeParse(formData);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const { nome, email, username, password, role, activo } = validated.data;

  const existe = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existe) return { error: existe.email === email ? "Email já existe" : "Username já existe" };

  const hash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { nome, email, username, password: hash, role, activo },
  });

  revalidatePath("/utilizadores");
  return { success: true };
}

export async function editarUtilizadorAction(id: string, formData: unknown) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão" };

  const validated = editarUtilizadorSchema.safeParse(formData);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const { nome, email, role, activo, password } = validated.data;

  const data: any = { nome, email, role, activo };
  if (password && password.trim() !== "") {
    data.password = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({ where: { id }, data });

  revalidatePath("/utilizadores");
  return { success: true };
}

export async function toggleUtilizadorAction(id: string, activo: boolean) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Sem permissão" };
  if (session?.user?.id === id) return { error: "Não podes desactivar a tua própria conta" };

  await prisma.user.update({ where: { id }, data: { activo } });
  revalidatePath("/utilizadores");
  return { success: true };
}
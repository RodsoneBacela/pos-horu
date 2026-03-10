"use server";

import { revalidatePath } from "next/cache";
import { auth }           from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import { z }              from "zod";

const abrirSchema = z.object({
  saldoInicial: z.coerce.number().min(0, "Saldo inválido"),
  observacoes:  z.string().max(300).optional().nullable(),
});

const fecharSchema = z.object({
  caixaId:      z.string().min(1),
  saldoFinal:   z.coerce.number().min(0, "Saldo inválido"),
  observacoes:  z.string().max(300).optional().nullable(),
});

export async function abrirCaixaAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Não autenticado" };

  // Verificar se já existe caixa aberta
  const aberta = await prisma.caixa.findFirst({ where: { estado: "ABERTA" } });
  if (aberta) return { error: "Já existe uma caixa aberta" };

  const validated = abrirSchema.safeParse(formData);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const { saldoInicial, observacoes } = validated.data;

  await prisma.caixa.create({
    data: {
      userId:        session.user.id,
      saldoInicial,
      totalVendas:   0,
      totalDinheiro: 0,
      totalMpesa:    0,
      totalEmola:    0,
      totalCartao:   0,
      totalTransf:   0,
      qtdVendas:     0,
      estado:        "ABERTA",
      observacoes,
      abertaEm:      new Date(),
    },
  });

  revalidatePath("/caixa");
  revalidatePath("/pos");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function fecharCaixaAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Não autenticado" };

  const validated = fecharSchema.safeParse(formData);
  if (!validated.success) return { error: validated.error.issues[0].message };

  const { caixaId, saldoFinal, observacoes } = validated.data;

  const caixa = await prisma.caixa.findFirst({
    where: { id: caixaId, estado: "ABERTA" },
  });
  if (!caixa) return { error: "Caixa não encontrada ou já fechada" };

  await prisma.caixa.update({
    where: { id: caixaId },
    data: {
      estado:    "FECHADA",
      saldoFinal,
      fechadaEm: new Date(),
      observacoes: observacoes ?? caixa.observacoes,
    },
  });

  revalidatePath("/caixa");
  revalidatePath("/pos");
  revalidatePath("/dashboard");
  return { success: true };
}
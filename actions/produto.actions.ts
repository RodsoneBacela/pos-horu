"use server";

import { revalidatePath }   from "next/cache";
import { auth }             from "@/lib/auth";
import { prisma }           from "@/lib/prisma";
import { produtoSchema, ajusteStockSchema } from "@/lib/validations/produto.schema";

export async function criarProdutoAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Não autenticado" };

  const validated = produtoSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const data = validated.data;

  const existe = await prisma.produto.findUnique({
    where: { codigo: data.codigo },
  });
  if (existe) return { error: "Código de produto já existe" };

  try {
    const produto = await prisma.produto.create({ data });
    revalidatePath("/produtos");
    revalidatePath("/stock");
    revalidatePath("/dashboard");
    return { success: true, id: produto.id };
  } catch {
    return { error: "Erro ao criar produto" };
  }
}

export async function editarProdutoAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Não autenticado" };

  const validated = produtoSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    await prisma.produto.update({
      where: { id },
      data:  validated.data,
    });
    revalidatePath("/produtos");
    revalidatePath("/stock");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Erro ao actualizar produto" };
  }
}

export async function eliminarProdutoAction(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Não autenticado" };

  const temVendas = await prisma.vendaItem.findFirst({
    where: { produtoId: id },
  });

  if (temVendas) {
    await prisma.produto.update({
      where: { id },
      data:  { activo: false },
    });
  } else {
    await prisma.produto.delete({ where: { id } });
  }

  revalidatePath("/produtos");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function ajustarStockAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Não autenticado" };

  const validated = ajusteStockSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { produtoId, tipo, quantidade, motivo } = validated.data;

  const produto = await prisma.produto.findUnique({
    where: { id: produtoId },
  });
  if (!produto) return { error: "Produto não encontrado" };

  const novoStock = tipo === "AJUSTE_POSITIVO"
    ? produto.stockActual + quantidade
    : produto.stockActual - quantidade;

  if (novoStock < 0) return { error: "Stock não pode ser negativo" };


await prisma.$transaction([
  prisma.produto.update({
    where: { id: produtoId },
    data:  { stockActual: novoStock },
  }),
  prisma.movimentoStock.create({
    data: {
      produtoId,
      tipo,
      quantidade,
      quantidadeAntes:  produto.stockActual,  
      quantidadeDepois: novoStock,
      motivo,
      userId: session.user.id,
    },
  }),
]);

  revalidatePath("/stock");
  revalidatePath("/produtos");
  revalidatePath("/dashboard");
  return { success: true, novoStock };
}
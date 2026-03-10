"use server";

import { revalidatePath } from "next/cache";
import { auth }           from "@/lib/auth";
import { prisma }         from "@/lib/prisma";
import { z }              from "zod";

const empresaSchema = z.object({
  nome:        z.string().min(2, "Nome obrigatório"),
  nif:         z.string().max(20).optional().nullable(),
  endereco:    z.string().max(200).optional().nullable(),
  telefone:    z.string().max(20).optional().nullable(),
  email:       z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  website:     z.string().max(100).optional().nullable(),
  moeda:       z.string().default("MT"),
  timezone:    z.string().default("Africa/Maputo"),
  tipoNegocio: z.string().default("FARMACIA"),
});

const taxaIvaSchema = z.object({
  nome:   z.string().min(1, "Nome obrigatório"),
  taxa:   z.coerce.number().min(0).max(100),
  padrao: z.boolean().default(false),
  activo: z.boolean().default(true),
});

const categoriaSchema = z.object({
  nome:   z.string().min(1, "Nome obrigatório"),
  cor:    z.string().default("#64748b"),
  icone:  z.string().optional().nullable(),
  activo: z.boolean().default(true),
});

const unidadeSchema = z.object({
  nome:        z.string().min(1, "Nome obrigatório"),
  abreviatura: z.string().max(10).optional().nullable(),
  activo:      z.boolean().default(true),
});

async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Sem permissão");
}

export async function salvarEmpresaAction(formData: unknown) {
  try {
    await checkAdmin();
    const data = empresaSchema.parse(formData);
    await prisma.empresa.upsert({
      where:  { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
    revalidatePath("/configuracoes");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Erro ao guardar" };
  }
}

// ── Taxa IVA
export async function criarTaxaIvaAction(formData: unknown) {
  try {
    await checkAdmin();
    const data = taxaIvaSchema.parse(formData);
    if (data.padrao) {
      await prisma.taxaIva.updateMany({ data: { padrao: false } });
    }
    await prisma.taxaIva.create({ data });
    revalidatePath("/configuracoes");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Erro ao criar" };
  }
}

export async function editarTaxaIvaAction(id: string, formData: unknown) {
  try {
    await checkAdmin();
    const data = taxaIvaSchema.parse(formData);
    if (data.padrao) {
      await prisma.taxaIva.updateMany({ where: { NOT: { id } }, data: { padrao: false } });
    }
    await prisma.taxaIva.update({ where: { id }, data });
    revalidatePath("/configuracoes");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Erro ao editar" };
  }
}

export async function eliminarTaxaIvaAction(id: string) {
  try {
    await checkAdmin();
    const emUso = await prisma.produto.findFirst({ where: { taxaIvaId: id } });
    if (emUso) return { error: "Taxa em uso por produtos — não pode ser eliminada" };
    await prisma.taxaIva.delete({ where: { id } });
    revalidatePath("/configuracoes");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Erro ao eliminar" };
  }
}

export async function criarCategoriaAction(formData: unknown) {
  try {
    await checkAdmin();
    const data = categoriaSchema.parse(formData);
    await prisma.categoria.create({ data });
    revalidatePath("/configuracoes");
    revalidatePath("/produtos");
    return { success: true };
  } catch (e: any) {
    return { error: e.errors?.[0]?.message ?? e.message ?? "Erro ao criar" };
  }
}

export async function editarCategoriaAction(id: string, formData: unknown) {
  try {
    await checkAdmin();
    const data = categoriaSchema.parse(formData);
    await prisma.categoria.update({ where: { id }, data });
    revalidatePath("/configuracoes");
    revalidatePath("/produtos");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Erro ao editar" };
  }
}

export async function eliminarCategoriaAction(id: string) {
  try {
    await checkAdmin();
    const emUso = await prisma.produto.findFirst({ where: { categoriaId: id } });
    if (emUso) return { error: "Categoria em uso por produtos — não pode ser eliminada" };
    await prisma.categoria.delete({ where: { id } });
    revalidatePath("/configuracoes");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Erro ao eliminar" };
  }
}

export async function criarUnidadeAction(formData: unknown) {
  try {
    await checkAdmin();
    const data = unidadeSchema.parse(formData);
    await prisma.unidadeMedida.create({ data });
    revalidatePath("/configuracoes");
    return { success: true };
  } catch (e: any) {
    return { error: e.errors?.[0]?.message ?? e.message ?? "Erro ao criar" };
  }
}

export async function editarUnidadeAction(id: string, formData: unknown) {
  try {
    await checkAdmin();
    const data = unidadeSchema.parse(formData);
    await prisma.unidadeMedida.update({ where: { id }, data });
    revalidatePath("/configuracoes");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Erro ao editar" };
  }
}

export async function eliminarUnidadeAction(id: string) {
  try {
    await checkAdmin();
    const emUso = await prisma.produto.findFirst({ where: { unidadeId: id } });
    if (emUso) return { error: "Unidade em uso por produtos — não pode ser eliminada" };
    await prisma.unidadeMedida.delete({ where: { id } });
    revalidatePath("/configuracoes");
    return { success: true };
  } catch (e: any) {
    return { error: e.message ?? "Erro ao eliminar" };
  }
}
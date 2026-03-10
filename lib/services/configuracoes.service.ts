import { prisma } from "@/lib/prisma";

export async function getConfiguracoes() {
  const [empresa, taxasIva, categorias, unidades] = await Promise.all([
    prisma.empresa.findFirst(),
    prisma.taxaIva.findMany({ orderBy: { taxa: "asc" } }),
    prisma.categoria.findMany({ orderBy: { nome: "asc" } }),
    prisma.unidadeMedida.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return {
    empresa: empresa ? {
      ...empresa,
      createdAt: empresa.createdAt.toISOString(),
      updatedAt: empresa.updatedAt.toISOString(),
    } : null,
    taxasIva: taxasIva.map(t => ({ ...t, taxa: Number(t.taxa), createdAt: t.createdAt.toISOString() })),
    categorias: categorias.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })),
    unidades: unidades.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })),
  };
}

export type ConfigEmpresa   = NonNullable<Awaited<ReturnType<typeof getConfiguracoes>>["empresa"]>;
export type ConfigTaxaIva   = Awaited<ReturnType<typeof getConfiguracoes>>["taxasIva"][number];
export type ConfigCategoria = Awaited<ReturnType<typeof getConfiguracoes>>["categorias"][number];
export type ConfigUnidade   = Awaited<ReturnType<typeof getConfiguracoes>>["unidades"][number];
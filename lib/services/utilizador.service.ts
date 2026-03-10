import { prisma } from "@/lib/prisma";

export async function getUtilizadores() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id:        true,
      nome:      true,
      email:     true,
      username:  true,
      role:      true,
      activo:    true,
      createdAt: true,
      _count: {
        select: { vendas: true },
      },
    },
  });

  return users.map(u => ({
    ...u,
    createdAt:   u.createdAt.toISOString(),
    totalVendas: u._count.vendas,
  }));
}

export type UtilizadorItem = Awaited<ReturnType<typeof getUtilizadores>>[number];
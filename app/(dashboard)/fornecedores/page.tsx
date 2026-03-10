import { requireAuth }       from "@/lib/auth-guard";
import { getFornecedores }   from "@/lib/services/compras.service";
import { FornecedoresClient } from "@/components/compras/fornecedores-client";

export const metadata = { title: "Fornecedores — HoruPOS" };
export const dynamic  = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function FornecedoresPage({ searchParams }: PageProps) {
  await requireAuth(["ADMIN", "GERENTE"]);
  const params       = await searchParams;
  const fornecedores = await getFornecedores(params.search);
  return <FornecedoresClient fornecedores={fornecedores} searchParams={params} />;
}
import { requireAuth }      from "@/lib/auth-guard";
import { getCompras, getFornecedores, getProdutosParaCompra } from "@/lib/services/compras.service";
import { ComprasClient }    from "@/components/compras/compras-client";

export const metadata = { title: "Compras — HoruPOS" };
export const dynamic  = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?:       string;
    fornecedorId?: string;
    estado?:       string;
    page?:         string;
  }>;
}

export default async function ComprasPage({ searchParams }: PageProps) {
  await requireAuth(["ADMIN", "GERENTE"]);

  const params = await searchParams;

  const [result, fornecedores, produtos] = await Promise.all([
    getCompras({
      search:       params.search,
      fornecedorId: params.fornecedorId,
      estado:       params.estado,
      page:         params.page ? parseInt(params.page) : 1,
    }),
    getFornecedores(),
    getProdutosParaCompra(),
  ]);

  return (
    <ComprasClient
      result={result}
      fornecedores={fornecedores}
      produtos={produtos}
      searchParams={params}
    />
  );
}
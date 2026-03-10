import { Suspense }        from "react";
import { requireAuth }     from "@/lib/auth-guard";
import { getProdutos, getCategorias, getUnidades, getTaxasIva } from "@/lib/services/produto.service";
import { ProdutosClient }  from "../../../components/produtos/produtos-client";

export const metadata = { title: "Produtos — HoruPOS" };
export const dynamic   = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?:      string;
    categoriaId?: string;
    estado?:      string;
    page?:        string;
  }>;
}

export default async function ProdutosPage({ searchParams }: PageProps) {
  await requireAuth(["ADMIN", "GERENTE"]);

  const params = await searchParams;

  const [result, categorias, unidades, taxasIva] = await Promise.all([
    getProdutos({
      search:      params.search,
      categoriaId: params.categoriaId,
      estado:      params.estado as any,
      page:        params.page ? parseInt(params.page) : 1,
    }),
    getCategorias(),
    getUnidades(),
    getTaxasIva(),
  ]);

  return (
    <ProdutosClient
      result={result}
      categorias={categorias}
      unidades={unidades}
      taxasIva={taxasIva}
      searchParams={params}
    />
  );
}
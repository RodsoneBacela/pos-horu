import { requireAuth }   from "@/lib/auth-guard";
import { getStockProdutos } from "@/lib/services/stock.service";
import { getCategorias }    from "@/lib/services/produto.service";
import { StockClient }      from "@/components/stock/stock-client";

export const metadata = { title: "Stock — HoruPOS" };
export const dynamic  = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?:      string;
    categoriaId?: string;
    alerta?:      string;
    page?:        string;
  }>;
}

export default async function StockPage({ searchParams }: PageProps) {;
  await requireAuth(["ADMIN", "GERENTE"]);

  const params = await searchParams;

  const [result, categorias] = await Promise.all([
    getStockProdutos({
      search:      params.search,
      categoriaId: params.categoriaId,
      alerta:      params.alerta as any,
      page:        params.page ? parseInt(params.page) : 1,
    }),
    getCategorias(),
  ]);

  return (
    <StockClient
      result={result}
      categorias={categorias}
      searchParams={params}
    />
  );
}
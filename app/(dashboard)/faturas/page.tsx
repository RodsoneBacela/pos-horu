import { requireAuth }   from "@/lib/auth-guard";
import { getFaturas }    from "@/lib/services/fatura.service";
import { FaturasClient } from "@/components/faturas/faturas-client";

export const metadata = { title: "Faturas — HoruPOS" };
export const dynamic  = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?:  string;
    metodo?:  string;
    dataIni?: string;
    dataFim?: string;
    page?:    string;
  }>;
}

export default async function FaturasPage({ searchParams }: PageProps) {
  await requireAuth();

  const params = await searchParams;

  const result = await getFaturas({
    search:   params.search,
    metodo:   params.metodo,
    dataIni:  params.dataIni,
    dataFim:  params.dataFim,
    page:     params.page ? parseInt(params.page) : 1,
  });

  return (
    <FaturasClient
      result={result}
      searchParams={params}
    />
  );
}
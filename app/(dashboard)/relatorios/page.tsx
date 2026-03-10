import { requireAuth }       from "@/lib/auth-guard";
import { RelatoriosClient }  from "@/components/relatorios/relatorios-client";
import {
  getRelatorioVendas,
  getRelatorioProdutos,
  getRelatorioStock,
} from "@/lib/services/relatorios.service";

export const metadata = { title: "Relatórios — HoruPOS" };
export const dynamic  = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    dataIni?: string;
    dataFim?: string;
    tab?:     string;
  }>;
}

function defaultDates() {
  const fim = new Date();
  const ini = new Date();
  ini.setDate(1);
  return {
    ini: ini.toISOString().slice(0, 10),
    fim: fim.toISOString().slice(0, 10),
  };
}

export default async function RelatoriosPage({ searchParams }: PageProps) {
  await requireAuth(["ADMIN", "GERENTE"]);

  const params   = await searchParams;
  const defaults = defaultDates();
  const dataIni  = params.dataIni ?? defaults.ini;
  const dataFim  = params.dataFim ?? defaults.fim;

  const [vendas, produtos, stock] = await Promise.all([
    getRelatorioVendas({ dataIni, dataFim }),
    getRelatorioProdutos({ dataIni, dataFim }),
    getRelatorioStock(),
  ]);

  return (
    <RelatoriosClient
      vendas={vendas}
      produtos={produtos}
      stock={stock}
      dataIni={dataIni}
      dataFim={dataFim}
      tabActiva={params.tab ?? "vendas"}
    />
  );
}
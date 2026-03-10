import { requireAuth }        from "@/lib/auth-guard";
import { getCaixaActual, getHistoricoCaixas } from "@/lib/services/caixa.service";
import { CaixaClient }        from "@/components/caixa/caixa-client";

export const metadata = { title: "Caixa — HoruPOS" };
export const dynamic  = "force-dynamic";

export default async function CaixaPage() {
  await requireAuth();

  const [caixaActual, historico] = await Promise.all([
    getCaixaActual(),
    getHistoricoCaixas(),
  ]);

  return (
    <CaixaClient
      caixaActual={caixaActual}
      historico={historico}
    />
  );
}
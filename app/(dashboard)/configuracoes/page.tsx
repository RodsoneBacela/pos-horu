import { requireAuth }        from "@/lib/auth-guard";
import { getConfiguracoes }   from "@/lib/services/configuracoes.service";
import { ConfiguracoesClient } from "@/components/configuracoes/configuracoes-client";

export const metadata = { title: "Configurações — HoruPOS" };
export const dynamic  = "force-dynamic";

export default async function ConfiguracoesPage() {
  await requireAuth(["ADMIN"]);
  const data = await getConfiguracoes();
  return <ConfiguracoesClient data={data} />;
}
import { requireAuth }       from "@/lib/auth-guard";
import { getUtilizadores }   from "@/lib/services/utilizador.service";
import { UtilizadoresClient } from "@/components/utilizadores/utilizadores-client";

export const metadata = { title: "Utilizadores — HoruPOS" };
export const dynamic  = "force-dynamic";


export default async function UtilizadoresPage() {
  await requireAuth(["ADMIN"]);
  const utilizadores = await getUtilizadores();
  return <UtilizadoresClient utilizadores={utilizadores} />;
}
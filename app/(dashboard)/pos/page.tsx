import { requireAuth }          from "@/lib/auth-guard";
import { getProdutosParaPOS, getCaixaAberta } from "@/lib/services/pos.service";
import { PosPageClient }        from "@/components/pos/pos-page-client";
import { redirect }             from "next/navigation";

export const metadata = { title: "POS — HoruPOS" };
export const dynamic  = "force-dynamic";

export default async function PosPage() {
  await requireAuth();

  const [produtos, caixa] = await Promise.all([
    getProdutosParaPOS(),
    getCaixaAberta(),
  ]);

  if (!caixa) {
    redirect("/caixa");
  }

  return (
    <PosPageClient
      produtos={produtos}
      caixaId={caixa.id}
    />
  );
}
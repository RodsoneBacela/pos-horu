"use client";

import { useState }          from "react";
import { useRouter }         from "next/navigation";
import { Building2, Percent, Tag, Ruler } from "lucide-react";
import { cn }                from "@/lib/utils";
import { EmpresaForm }       from "@/components/configuracoes/empresa-form";
import { TaxasIvaSection }   from "@/components/configuracoes/taxas-iva-section";
import { CategoriasSection } from "@/components/configuracoes/categorias-section";
import { UnidadesSection }   from "@/components/configuracoes/unidades-section";

const TABS = [
  { id: "empresa",    label: "Empresa",    icon: Building2 },
  { id: "taxas",      label: "Taxas IVA",  icon: Percent   },
  { id: "categorias", label: "Categorias", icon: Tag       },
  { id: "unidades",   label: "Unidades",   icon: Ruler     },
];

export function ConfiguracoesClient({ data }: { data: any }) {
  const router            = useRouter();
  const [tab, setTab]     = useState("empresa");

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configurações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gestão do sistema e parametrizações</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-semibold transition-all",
              tab === id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-150 shadow-sm">
        {tab === "empresa"    && <EmpresaForm       empresa={data.empresa}    onSuccess={() => router.refresh()} />}
        {tab === "taxas"      && <TaxasIvaSection   taxas={data.taxasIva}     onSuccess={() => router.refresh()} />}
        {tab === "categorias" && <CategoriasSection categorias={data.categorias} onSuccess={() => router.refresh()} />}
        {tab === "unidades"   && <UnidadesSection   unidades={data.unidades}  onSuccess={() => router.refresh()} />}
      </div>
    </div>
  );
}
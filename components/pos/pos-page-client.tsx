"use client";

import { useState }        from "react";
import { PosProductGrid }  from "@/components/pos/pos-product-grid";
import { PosCart }         from "@/components/pos/pos-cart";
import { PosReceiptModal } from "@/components/pos/pos-receipt-modal";
import { ProdutoPOS }      from "@/lib/services/pos.service";

interface PosPageClientProps {
  produtos: ProdutoPOS[];
  caixaId:  string;
}

export function PosPageClient({ produtos, caixaId }: PosPageClientProps) {
  const [receipt, setReceipt] = useState<any>(null);
  const [error,   setError]   = useState<string | null>(null);

  return (
    <>
      <div className="flex gap-4 h-full -m-6 p-4">

        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          {error && (
            <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
              <span>⚠ {error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-lg leading-none ml-2">×</button>
            </div>
          )}
          <PosProductGrid produtos={produtos} />
        </div>

        <div className="w-85 shrink-0 flex flex-col min-h-0">
          <PosCart
            caixaId={caixaId}
            onSuccess={(result) => {
              console.log("🎯 onSuccess recebeu:", result);
              setReceipt(result);
              setError(null);
            }}
            onError={(msg) => setError(msg)}
          />
        </div>
      </div>

      {receipt && (
        <PosReceiptModal
          open={true}
          onClose={() => setReceipt(null)}
          data={receipt}
        />
      )}
    </>
  );
}
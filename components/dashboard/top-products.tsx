interface TopProduct {
  nomeProduto: string;
  _sum: {
    quantidade: number | null;
    subtotal:   any;
  };
}

interface TopProductsProps {
  products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-gray-400">Sem vendas hoje ainda</p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...products.map((p) => Number(p._sum.subtotal ?? 0))
  );

  return (
    <div className="space-y-3">
      {products.map((product, index) => {
        const valor = Number(product._sum.subtotal ?? 0);
        const pct   = maxValue > 0 ? (valor / maxValue) * 100 : 0;

        return (
          <div key={product.nomeProduto} className="flex items-center gap-3">
            {/* Rank */}
            <div className={`
              w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0
              ${index < 3 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}
            `}>
              {index + 1}
            </div>

            {/* Nome + barra */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {product.nomeProduto}
                </span>
                <span className="text-xs font-mono text-gray-500 ml-2 flex-shrink-0">
                  {product._sum.quantidade ?? 0} un
                </span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Valor */}
            <span className="text-xs font-bold text-gray-900 font-serif flex-shrink-0 w-20 text-right">
              MT {valor.toLocaleString("pt-MZ", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
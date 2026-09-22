"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { deleteSale } from "@/lib/api";
import { formatDate, formatMoney, formatQuantity } from "@/lib/format";
import type { StoreData } from "@/lib/types";
import { SaleForm } from "./store-forms";
import { ApiError, Empty, lossText, mutedText, Notice, PageIntro, Panel, panelTitle, primaryButton, profitText, quietButton, Shell, tableHead, tableRow } from "./shell";
import { useStore } from "./use-store";

export function SalesSection({ initial }: { initial: StoreData }) {
  const { data, notice, refresh } = useStore(initial);
  const [open, setOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const available = data.products.filter((product) => product.currentStock > 0);

  async function removeSale(id: string, name: string) {
    const confirmed = window.confirm(`Delete this sale of ${name}? The quantity goes back on the shelf, and the profit is removed.`);
    if (!confirmed) return;
    setRemovingId(id);
    setActionError(null);
    try {
      await deleteSale(id);
      await refresh("Sale deleted. The quantity is back on the shelf.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not delete the sale");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Shell>
      <PageIntro
        title="Sales"
        text="Sell products that are on the shelf. You set the selling price, and the profit is revenue minus the buying cost."
        action={
          <button type="button" className={primaryButton} onClick={() => setOpen(true)} disabled={available.length === 0}>
            <ShoppingCart size={18} /> New sale
          </button>
        }
      />
      <ApiError message={data.error} onRetry={() => refresh()} />
      <Notice message={notice} />
      {actionError ? <p className="rounded-3xl border border-[#e7c1bc] bg-[#fffdf8] px-4 py-3 text-[#b42318]">{actionError}</p> : null}
      {available.length === 0 ? (
        <p className="rounded-3xl border border-[#eadfce] bg-[#fffdf8] px-4 py-3 text-[#9a3412]">
          Nothing is in stock, so there is nothing to sell. Record a purchase in Stock first.
        </p>
      ) : null}
      <Panel>
        <h2 className={panelTitle}>Ready to sell</h2>
        {available.length === 0 ? (
          <Empty text="No products have a remaining quantity." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-base">
              <thead className={tableHead}>
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Available</th>
                  <th className="px-4 py-3 font-semibold">Suggested price</th>
                </tr>
              </thead>
              <tbody>
                {available.map((product) => (
                  <tr key={product.id} className={tableRow}>
                    <td className="px-4 py-3 font-semibold">{product.name}</td>
                    <td className="px-4 py-3">{formatQuantity(product.currentStock, product.unit)}</td>
                    <td className="px-4 py-3">{formatMoney(product.defaultSellingPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <Panel>
        <h2 className={panelTitle}>Sales made</h2>
        {data.sales.length === 0 ? (
          <Empty text="No sales yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-base">
              <thead className={tableHead}>
                <tr>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold">Selling price</th>
                  <th className="px-4 py-3 font-semibold">Revenue</th>
                  <th className="px-4 py-3 font-semibold">Profit</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.sales.map((sale) => (
                  <tr key={sale.id} className={tableRow}>
                    <td className="px-4 py-3">{formatDate(sale.date)}</td>
                    <td className="px-4 py-3">
                      {sale.productName}
                      {sale.customerName ? <span className={`block ${mutedText}`}>{sale.customerName}</span> : null}
                    </td>
                    <td className="px-4 py-3">{formatQuantity(sale.quantity, sale.unit)}</td>
                    <td className="px-4 py-3">{formatMoney(sale.unitSellingPrice)}</td>
                    <td className="px-4 py-3">{formatMoney(sale.totalRevenue)}</td>
                    <td className={`px-4 py-3 ${sale.profit < 0 ? lossText : profitText}`}>
                      {formatMoney(sale.profit)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className={`${quietButton} text-[#b42318]`}
                        disabled={removingId === sale.id}
                        onClick={() => removeSale(sale.id, sale.productName)}
                      >
                        {removingId === sale.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {open ? (
        <SaleForm products={available} onClose={() => setOpen(false)} onSaved={() => refresh("Sale saved. Stock is reduced and profit is recorded.")} />
      ) : null}
    </Shell>
  );
}

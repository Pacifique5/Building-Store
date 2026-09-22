"use client";

import { PackagePlus } from "lucide-react";
import { useState } from "react";
import { deletePurchase } from "@/lib/api";
import { formatDate, formatMoney, formatQuantity, stockLabel } from "@/lib/format";
import type { StoreData } from "@/lib/types";
import { PurchaseForm } from "./store-forms";
import { ApiError, Empty, mutedText, Notice, PageIntro, Panel, panelTitle, primaryButton, profitText, quietButton, Shell, statCard, tableHead, tableRow, warnText } from "./shell";
import { useStore } from "./use-store";

export function StockSection({ initial }: { initial: StoreData }) {
  const { data, notice, refresh } = useStore(initial);
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState<string | undefined>();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const onShelf = data.products.filter((product) => product.currentStock > 0);
  const missing = data.products.filter((product) => product.currentStock <= 0);

  function openPurchase(id?: string) {
    setProductId(id);
    setOpen(true);
  }

  async function removePurchase(id: string, name: string) {
    const confirmed = window.confirm(`Delete this purchase of ${name}? The quantity comes off the shelf.`);
    if (!confirmed) return;
    setRemovingId(id);
    setActionError(null);
    try {
      await deletePurchase(id);
      await refresh("Purchase deleted. The shelf quantity is updated.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not delete the purchase");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Shell>
      <PageIntro
        title="Stock"
        text="What is physically in the shop right now, how much is left, and whether that amount is high or low."
        action={
          <button type="button" className={primaryButton} onClick={() => openPurchase()} disabled={data.products.length === 0}>
            <PackagePlus size={18} /> Record a purchase
          </button>
        }
      />
      <ApiError message={data.error} onRetry={() => refresh()} />
      <Notice message={notice} />
      {actionError ? <p className="rounded-3xl border border-[#e7c1bc] bg-[#fffdf8] px-4 py-3 text-[#b42318]">{actionError}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <article className={statCard}>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#78716c]">High stock</p>
          <p className="mt-2 text-3xl font-semibold text-[#14532d]">{data.dashboard?.highStockCount ?? 0}</p>
          <p className={`mt-1 ${mutedText}`}>Above the alert level</p>
        </article>
        <article className={statCard}>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#78716c]">Low stock</p>
          <p className="mt-2 text-3xl font-semibold text-[#9a3412]">{data.dashboard?.lowStockCount ?? 0}</p>
          <p className={`mt-1 ${mutedText}`}>Still some left, at or under the alert</p>
        </article>
      </div>
      <Panel>
        <h2 className={panelTitle}>On the shelf</h2>
        {onShelf.length === 0 ? (
          <Empty text="Nothing is in the shop yet. Record a purchase to put products on the shelf." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-base">
              <thead className={tableHead}>
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Remaining</th>
                  <th className="px-4 py-3 font-semibold">Level</th>
                  <th className="px-4 py-3 font-semibold">Alert at</th>
                  <th className="px-4 py-3 font-semibold">Value at cost</th>
                </tr>
              </thead>
              <tbody>
                {onShelf.map((product) => (
                  <tr key={product.id} className={tableRow}>
                    <td className="px-4 py-3 font-semibold">{product.name}</td>
                    <td className="px-4 py-3">{formatQuantity(product.currentStock, product.unit)}</td>
                    <td className="px-4 py-3">
                      <span className={product.stockStatus === "LOW_STOCK" ? warnText : profitText}>
                        {stockLabel(product.stockStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatQuantity(product.minThreshold, product.unit)}</td>
                    <td className="px-4 py-3">{formatMoney(product.inventoryValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <Panel>
        <h2 className={panelTitle}>Not in the shop</h2>
        {data.products.length === 0 ? (
          <Empty text="The catalog is empty. Add products first, then buy them into the shop." />
        ) : missing.length === 0 ? (
          <Empty text="Every catalog product has some stock." />
        ) : (
          <ul>
            {missing.map((product) => (
              <li key={product.id} className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${tableRow} first:border-t-0`}>
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className={mutedText}>Listed in Products, nothing left to sell</p>
                </div>
                <button type="button" className={quietButton} onClick={() => openPurchase(product.id)}>
                  Stock in
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel>
        <h2 className={panelTitle}>Purchases</h2>
        {data.purchases.length === 0 ? (
          <Empty text="No purchases recorded yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-base">
              <thead className={tableHead}>
                <tr>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold">Buying price</th>
                  <th className="px-4 py-3 font-semibold">Total cost</th>
                  <th className="px-4 py-3 font-semibold">Supplier</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.purchases.map((purchase) => (
                  <tr key={purchase.id} className={tableRow}>
                    <td className="px-4 py-3">{formatDate(purchase.date)}</td>
                    <td className="px-4 py-3">{purchase.productName}</td>
                    <td className="px-4 py-3">{formatQuantity(purchase.quantity, purchase.unit)}</td>
                    <td className="px-4 py-3">{formatMoney(purchase.unitBuyingPrice)}</td>
                    <td className="px-4 py-3">{formatMoney(purchase.totalCost)}</td>
                    <td className="px-4 py-3">{purchase.supplierName || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className={`${quietButton} text-[#b42318]`}
                        disabled={removingId === purchase.id}
                        onClick={() => removePurchase(purchase.id, purchase.productName)}
                      >
                        {removingId === purchase.id ? "Deleting..." : "Delete"}
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
        <PurchaseForm
          products={data.products}
          initialProductId={productId}
          onClose={() => setOpen(false)}
          onSaved={() => refresh("Purchase recorded. The shelf quantity is updated.")}
        />
      ) : null}
    </Shell>
  );
}

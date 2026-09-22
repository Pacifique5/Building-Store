"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { formatMoney, formatQuantity, stockLabel } from "@/lib/format";
import type { Product, StoreData } from "@/lib/types";
import { ProductForm } from "./store-forms";
import { ApiError, badgeHigh, badgeLow, badgeOut, Empty, Notice, PageIntro, Panel, primaryButton, quietButton, Shell, tableHead, tableRow } from "./shell";
import { useStore } from "./use-store";

const levelClass = {
  IN_STOCK: badgeHigh,
  LOW_STOCK: badgeLow,
  OUT_OF_STOCK: badgeOut,
};

export function ProductsSection({ initial }: { initial: StoreData }) {
  const { data, notice, refresh } = useStore(initial);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const categories = useMemo(() => [...new Set(data.products.map((product) => product.category))], [data.products]);
  const products = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.products.filter(
      (product) =>
        needle.length === 0 ||
        product.name.toLowerCase().includes(needle) ||
        product.category.toLowerCase().includes(needle),
    );
  }, [data.products, query]);

  return (
    <Shell>
      <PageIntro
        title="Products"
        text="Every product the shop is supposed to sell. A product can stay on this list even when the shelf is empty."
        action={
          <button type="button" className={primaryButton} onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus size={18} /> Add product
          </button>
        }
      />
      <ApiError message={data.error} onRetry={() => refresh()} />
      <Notice message={notice} />
      <Panel>
        <div className="border-b border-[#eadfce] p-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            className="h-12 w-full rounded-xl border border-[#e4d8c8] bg-white px-3 text-base outline-none focus:border-[#c4531a] focus:ring-4 focus:ring-[#f6e1d2]"
          />
        </div>
        {products.length === 0 ? (
          <Empty text="No products yet. Add the first item the shop sells." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-base">
              <thead className={tableHead}>
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Unit</th>
                  <th className="px-4 py-3 font-semibold">Usual buying price</th>
                  <th className="px-4 py-3 font-semibold">Suggested selling price</th>
                  <th className="px-4 py-3 font-semibold">On the shelf</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className={tableRow}>
                    <td className="px-4 py-3 font-semibold">{product.name}</td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">{product.unit}</td>
                    <td className="px-4 py-3">{formatMoney(product.defaultBuyingPrice)}</td>
                    <td className="px-4 py-3">{formatMoney(product.defaultSellingPrice)}</td>
                    <td className="px-4 py-3">
                      <span className={`mr-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase ${levelClass[product.stockStatus]}`}>
                        {stockLabel(product.stockStatus)}
                      </span>
                      {product.currentStock > 0 ? formatQuantity(product.currentStock, product.unit) : "None"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className={quietButton} onClick={() => { setEditing(product); setOpen(true); }}>
                        Edit
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
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setOpen(false)}
          onSaved={() => refresh(editing ? "Product updated." : "Product added to the catalog.")}
          onDeleted={() => refresh("Product deleted.")}
        />
      ) : null}
    </Shell>
  );
}

"use client";

import { formatMoney, formatQuantity, stockLabel } from "@/lib/format";
import type { StoreData } from "@/lib/types";
import { ApiError, Empty, lossText, mutedText, PageIntro, Panel, panelTitle, profitText, Shell, statCard, tableHead, tableRow, warnText } from "./shell";
import { useStore } from "./use-store";

export function AnalysisSection({ initial }: { initial: StoreData }) {
  const { data, refresh } = useStore(initial);
  const dashboard = data.dashboard;
  const todayProfit = dashboard?.todayProfit ?? 0;

  return (
    <Shell>
      <PageIntro
        title="Analysis"
        text="What the shelf is worth, what was sold today, and which products need buying."
      />
      <ApiError message={data.error} onRetry={() => refresh()} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Shelf value" value={formatMoney(dashboard?.inventoryValue ?? 0)} hint="Remaining stock at buying cost" />
        <Card label="Today's revenue" value={formatMoney(dashboard?.todayRevenue ?? 0)} hint={`${dashboard?.todaySalesCount ?? 0} sale${dashboard?.todaySalesCount === 1 ? "" : "s"}`} />
        <Card label="Today's profit" value={formatMoney(todayProfit)} hint={`Cost ${formatMoney(dashboard?.todayCost ?? 0)}`} alert={todayProfit < 0} />
        <Card label="Catalog" value={String(dashboard?.productCount ?? 0)} hint={`${dashboard?.highStockCount ?? 0} high, ${dashboard?.lowStockCount ?? 0} low, ${dashboard?.outOfStockCount ?? 0} out`} />
      </section>
      <Panel>
        <h2 className={panelTitle}>Needs buying</h2>
        {(dashboard?.productCount ?? 0) === 0 ? (
          <Empty text="Add products first. Low and empty items will show up here." />
        ) : (dashboard?.needsRestock.length ?? 0) === 0 ? (
          <Empty text="Every product is above its alert level." />
        ) : (
          <ul>
            {dashboard?.needsRestock.map((item) => (
              <li key={item.id} className={`flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${tableRow} first:border-t-0`}>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className={mutedText}>{item.category}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className={item.stockStatus === "OUT_OF_STOCK" ? lossText : warnText}>
                    {stockLabel(item.stockStatus)}
                  </p>
                  <p className={mutedText}>
                    {formatQuantity(item.currentStock, item.unit)} left, alert at {formatQuantity(item.minThreshold, item.unit)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel>
        <h2 className={panelTitle}>Profit by product</h2>
        {(dashboard?.byProduct.length ?? 0) === 0 ? (
          <Empty text="Profit appears here after the first sale." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-base">
              <thead className={tableHead}>
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Sold today</th>
                  <th className="px-4 py-3 font-semibold">Profit today</th>
                  <th className="px-4 py-3 font-semibold">Sold in total</th>
                  <th className="px-4 py-3 font-semibold">Profit in total</th>
                </tr>
              </thead>
              <tbody>
                {dashboard?.byProduct.map((row) => (
                  <tr key={row.productId} className={tableRow}>
                    <td className="px-4 py-3 font-semibold">{row.name}</td>
                    <td className="px-4 py-3">{formatQuantity(row.todayQuantity, row.unit)}</td>
                    <td className="px-4 py-3">{formatMoney(row.todayProfit)}</td>
                    <td className="px-4 py-3">{formatQuantity(row.quantitySold, row.unit)}</td>
                    <td className={`px-4 py-3 ${row.profit < 0 ? lossText : profitText}`}>{formatMoney(row.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </Shell>
  );
}

function Card({ label, value, hint, alert = false }: { label: string; value: string; hint: string; alert?: boolean }) {
  return (
    <article className={`${statCard} ${alert ? "border-[#f3c7c2]" : ""}`}>
      <p className="text-sm font-semibold uppercase tracking-wide text-[#78716c]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[#143028]">{value}</p>
      <p className={`mt-1 ${mutedText}`}>{hint}</p>
    </article>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, Package, ShoppingCart, Store } from "lucide-react";
import type { ReactNode } from "react";

const links = [
  { href: "/products", label: "Products", detail: "What we sell", icon: Boxes },
  { href: "/stock", label: "Stock", detail: "On the shelf", icon: Package },
  { href: "/sales", label: "Sales", detail: "Sell from stock", icon: ShoppingCart },
  { href: "/", label: "Analysis", detail: "Profit and alerts", icon: BarChart3 },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f6f1e7] text-[#1c1917]">
      <header className="border-b border-[#0e241c] bg-[#143028] text-[#f8f4ec]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#c4531a] text-white">
              <Store size={22} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0c7a6]">Murakaza Neza</p>
              <p className="text-2xl font-semibold tracking-tight">Building Store</p>
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex min-h-16 items-center gap-3 rounded-2xl px-3 py-2 ${active ? "bg-[#fffdf8] text-[#1c1917]" : "bg-[#1d3d32] text-[#f8f4ec] hover:bg-[#245041]"}`}
                >
                  <Icon size={20} className={active ? "text-[#c4531a]" : "text-[#f0c7a6]"} />
                  <span>
                    <span className="block text-base font-semibold leading-5">{link.label}</span>
                    <span className={`block text-sm ${active ? "text-[#78716c]" : "text-[#d6d3d1]"}`}>{link.detail}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}

export function PageIntro({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-base leading-7 text-[#57534e]">{text}</p>
      </div>
      {action}
    </div>
  );
}

export function ApiError({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  if (!message) return null;
  return (
    <div className="rounded-3xl border border-[#f3c7c2] bg-[#fdf2f0] px-4 py-3 text-[#8a1c13]">
      <p className="font-semibold">The shop API is not reachable.</p>
      <p className="mt-1 text-sm">{message}</p>
      <button type="button" onClick={onRetry} className="mt-3 h-11 rounded-xl bg-[#b42318] px-4 text-sm font-semibold text-white">
        Try again
      </button>
    </div>
  );
}

export function Notice({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="rounded-3xl border border-[#cfe3d6] bg-[#eef6f0] px-4 py-3 text-sm font-semibold text-[#14532d]">{message}</p>;
}

export function Panel({ children }: { children: ReactNode }) {
  return <section className="overflow-hidden rounded-3xl border border-[#eadfce] bg-[#fffdf8] shadow-sm">{children}</section>;
}

export function Empty({ text }: { text: string }) {
  return <p className="px-4 py-10 text-center text-[#78716c]">{text}</p>;
}

export const primaryButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#c4531a] px-4 text-base font-semibold text-white hover:bg-[#a34312] disabled:cursor-not-allowed disabled:bg-[#a8a29e]";
export const quietButton =
  "inline-flex h-10 items-center justify-center rounded-lg border border-[#e4d8c8] bg-white px-3 text-sm font-semibold text-[#143028] hover:bg-[#f6f1e7] disabled:cursor-not-allowed disabled:opacity-60";
export const dangerButton =
  "inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#e7c1bc] bg-white px-4 text-base font-semibold text-[#b42318] hover:bg-[#fdeceb] disabled:cursor-not-allowed disabled:opacity-60";
export const panelTitle = "border-b border-[#eadfce] px-4 py-3 text-lg font-semibold text-[#143028]";
export const tableHead = "bg-[#f6f1e7] text-sm text-[#57534e]";
export const tableRow = "border-t border-[#eadfce]";
export const mutedText = "text-sm text-[#78716c]";
export const statCard = "rounded-3xl border border-[#eadfce] bg-[#fffdf8] p-4 shadow-sm";
export const badgeHigh = "inline-flex rounded-full bg-[#e7f5ec] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#14532d]";
export const badgeLow = "inline-flex rounded-full bg-[#f8e7d4] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#9a3412]";
export const badgeOut = "inline-flex rounded-full bg-[#efeae2] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#57534e]";
export const profitText = "font-semibold text-[#166534]";
export const warnText = "font-semibold text-[#9a3412]";
export const lossText = "font-semibold text-[#b42318]";

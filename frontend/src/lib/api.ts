import type { DashboardMetrics, Product, Purchase, Sale, StoreData } from "./types";

export function apiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function readError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(" ");
    if (typeof body.message === "string") return body.message;
  } catch {
    return response.statusText || "Request failed";
  }
  return "Request failed";
}

export async function fetchStoreData(): Promise<StoreData> {
  try {
    const [dashboard, products, sales, purchases] = await Promise.all([
      request<DashboardMetrics>("/analytics/dashboard"),
      request<Product[]>("/products"),
      request<Sale[]>("/sales"),
      request<Purchase[]>("/purchases"),
    ]);
    return { dashboard, products, sales, purchases, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach the API";
    return {
      dashboard: null,
      products: [],
      sales: [],
      purchases: [],
      error: message,
    };
  }
}

export function createProduct(body: Record<string, unknown>) {
  return request<Product>("/products", { method: "POST", body: JSON.stringify(body) });
}

export function updateProduct(id: string, body: Record<string, unknown>) {
  return request<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export function deleteProduct(id: string) {
  return request<{ id: string }>(`/products/${id}`, { method: "DELETE" });
}

export function createPurchase(body: Record<string, unknown>) {
  return request<Purchase>("/purchases", { method: "POST", body: JSON.stringify(body) });
}

export function deletePurchase(id: string) {
  return request<{ id: string }>(`/purchases/${id}`, { method: "DELETE" });
}

export function createSale(body: Record<string, unknown>) {
  return request<Sale>("/sales", { method: "POST", body: JSON.stringify(body) });
}

export function deleteSale(id: string) {
  return request<{ id: string }>(`/sales/${id}`, { method: "DELETE" });
}

import { ProductsSection } from "@/components/products-section";
import { fetchStoreData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const initial = await fetchStoreData();
  return <ProductsSection initial={initial} />;
}

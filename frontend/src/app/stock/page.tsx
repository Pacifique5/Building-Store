import { StockSection } from "@/components/stock-section";
import { fetchStoreData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const initial = await fetchStoreData();
  return <StockSection initial={initial} />;
}

import { SalesSection } from "@/components/sales-section";
import { fetchStoreData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const initial = await fetchStoreData();
  return <SalesSection initial={initial} />;
}
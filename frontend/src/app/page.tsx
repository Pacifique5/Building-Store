import { AnalysisSection } from "@/components/analysis-section";
import { fetchStoreData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AnalysisPage() {
  const initial = await fetchStoreData();
  return <AnalysisSection initial={initial} />;
}

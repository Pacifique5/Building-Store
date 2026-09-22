"use client";

import { useState } from "react";
import { fetchStoreData } from "@/lib/api";
import type { StoreData } from "@/lib/types";

export function useStore(initial: StoreData) {
  const [data, setData] = useState(initial);
  const [notice, setNotice] = useState<string | null>(null);

  async function refresh(message?: string) {
    const next = await fetchStoreData();
    setData(next);
    if (message && !next.error) setNotice(message);
  }

  return { data, notice, refresh };
}

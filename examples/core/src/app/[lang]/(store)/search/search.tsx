"use client";
import SearchResults from "src/components/search/SearchResults";
import React from "react";
import { usePathname } from "next/navigation";
import { ProductListData } from "@epcc-sdk/sdks-shopper";

export function Search({ page }: { page?: ProductListData }) {
  const pathname = usePathname();
  const nodes = pathname.split("/search/")?.[1]?.split("/");

  return <SearchResults page={page} nodes={nodes} />;
}

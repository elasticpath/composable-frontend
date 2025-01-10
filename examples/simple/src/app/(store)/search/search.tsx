"use client";
import SearchResults from "../../../components/search/SearchResults";
import React from "react";
import { usePathname } from "next/navigation";
import { GetByContextAllProductsResponse } from "@epcc-sdk/sdks-shopper";

export function Search({ page }: { page?: GetByContextAllProductsResponse }) {
  const pathname = usePathname();
  const nodes = pathname.split("/search/")?.[1]?.split("/");

  return <SearchResults page={page} nodes={nodes} />;
}

"use client";
import SearchResults from "../../../components/search/SearchResults";
import React from "react";
import { ShopperProduct } from "@elasticpath/react-shopper-hooks";
import { ShopperCatalogResourcePage } from "@elasticpath/js-sdk";
import { usePathname } from "next/navigation";

export function Search({
  page,
}: {
  page?: ShopperCatalogResourcePage<ShopperProduct>;
}) {
  const pathname = usePathname();
  const nodes = pathname.split("/search/")?.[1]?.split("/");

  return <SearchResults page={page} nodes={nodes} />;
}

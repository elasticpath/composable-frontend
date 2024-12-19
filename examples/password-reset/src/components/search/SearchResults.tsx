"use client";
import Hits from "./Hits";
import Pagination from "./Pagination";
import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import NodeMenu from "./NodeMenu";
import { ShopperProduct, useStore } from "@elasticpath/react-shopper-hooks";
import { ProductsProvider } from "./ProductsProvider";
import { ShopperCatalogResourcePage } from "@elasticpath/js-sdk";
import { BreadcrumbLookup } from "../../lib/types/breadcrumb-lookup";
import { buildBreadcrumbLookup } from "../../lib/build-breadcrumb-lookup";
import MobileFilters from "./MobileFilters";

interface ISearchResults {
  page?: ShopperCatalogResourcePage<ShopperProduct>;
  nodes?: string[];
}

export default function SearchResults({
  page,
  nodes,
}: ISearchResults): JSX.Element {
  let [showFilterMenu, setShowFilterMenu] = useState(false);
  const { nav, client } = useStore();
  const lookup = buildBreadcrumbLookup(nav ?? []);
  const title = nodes ? resolveTitle(nodes, lookup) : "All Categories";

  return (
    <ProductsProvider client={client} page={page}>
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4">
          <div className="py-2">
            <span className="text-2xl font-bold md:text-4xl">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="block md:hidden">
              <button
                className="flex items-center justify-center gap-2 rounded-md px-4 py-2 text-base font-medium text-black transition-all duration-200 hover:bg-gray-100"
                onClick={() => setShowFilterMenu(true)}
              >
                Categories <ChevronDownIcon height={12} width={12} />
              </button>
              <MobileFilters
                lookup={lookup}
                showFilterMenu={showFilterMenu}
                setShowFilterMenu={setShowFilterMenu}
              />
            </div>
          </div>
        </div>
        <hr />
        <div className="grid grid-cols-[auto_1fr] gap-8">
          <div className="hidden w-[14rem] md:block lg:w-[16rem]">
            <h3 className="font-semibold">Category</h3>
            {nav && <NodeMenu nav={nav} />}
          </div>

          <div>
            <Hits />
            <div className="py-10">
              <Pagination />
            </div>
          </div>
        </div>
      </div>
    </ProductsProvider>
  );
}

function resolveTitle(slugArray: string[], lookup?: BreadcrumbLookup): string {
  return (
    lookup?.[`/${slugArray.join("/")}`]?.name ??
    slugArray[slugArray?.length - 1]
  );
}

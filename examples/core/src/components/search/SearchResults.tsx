"use client";
import Hits from "./Hits";
import { useState, type JSX } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import NodeMenu from "./NodeMenu";
import { ProductsProvider } from "./ProductsProvider";
import { BreadcrumbLookup } from "../../lib/types/breadcrumb-lookup";
import { buildBreadcrumbLookup } from "../../lib/build-breadcrumb-lookup";
import MobileFilters from "./MobileFilters";
import { ProductListData } from "@epcc-sdk/sdks-shopper";
import { useStore } from "../../app/[lang]/(store)/StoreProvider";
import { useElasticPathClient } from "../../app/[lang]/(store)/ClientProvider";
import { ResourcePagination } from "../pagination/ResourcePagination";

interface ISearchResults {
  page?: ProductListData;
  nodes?: string[];
}

export default function SearchResults({
  page,
  nodes,
}: ISearchResults): JSX.Element {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const { nav } = useStore();
  const { client } = useElasticPathClient();
  const lookup = buildBreadcrumbLookup(nav ?? []);
  const title = nodes ? resolveTitle(nodes, lookup) : "All Categories";

  const limit = page?.meta?.page?.limit ? Number(page?.meta?.page?.limit) : 100;
  const total = page?.meta?.results?.total
    ? Number(page?.meta?.results?.total)
    : 0;
  const totalPages = Math.ceil(total / limit);

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
        <hr className="border-gray-200" />
        <div className="grid grid-cols-[auto_1fr] gap-8">
          <div className="hidden w-[14rem] md:block lg:w-[16rem]">
            <h3 className="font-semibold">Category</h3>
            {nav && <NodeMenu nav={nav} />}
          </div>

          <div>
            <Hits />
            <div className="py-10">
              <ResourcePagination totalPages={totalPages} />
            </div>
          </div>
        </div>
      </div>
    </ProductsProvider>
  );
}

function resolveTitle(slugArray: string[], lookup?: BreadcrumbLookup): string {
  return (lookup?.[`/${slugArray.join("/")}`]?.name ??
    slugArray[slugArray?.length - 1])!;
}

import { useSortBy, useInstantSearch } from "react-instantsearch-hooks-web";
import { algoliaEnvData } from "../../lib/resolve-algolia-env";
import CustomHierarchicalMenu from "./CustomHierarchicalMenu";
import Hits from "./Hits";
import Pagination from "./Pagination";
import { BreadcrumbLookup } from "../../lib/types/breadcrumb-lookup";
import SearchBox from "./SearchBox";
import MobileFilters from "./MobileFilters";
import { hierarchicalAttributes } from "../../lib/hierarchical-attributes";
import PriceRangeSlider from "./price-range-slider/PriceRangeSliderWrapper";
import ProductSpecification from "./product-specification/ProductSpecification";
import { EP_CURRENCY_CODE } from "../../lib/resolve-ep-currency-code";
import { Popover, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const EP_ROUTE_PRICE = `ep_price.${EP_CURRENCY_CODE}.float_price`;

interface ISearchResults {
  lookup?: BreadcrumbLookup;
  NextRouterHandler: any;
}

function resolveTitle(slugArray: string[], lookup?: BreadcrumbLookup): string {
  return (
    lookup?.[`/${slugArray.join("/")}`]?.name ??
    slugArray[slugArray?.length - 1]
  );
}

export default function SearchResults({
  lookup,
  NextRouterHandler,
}: ISearchResults): JSX.Element {
  const { uiState } = useInstantSearch();
  let [showFilterMenu, setShowFilterMenu] = useState(false);

  const { options, refine } = useSortBy({
    items: [
      { label: "Featured", value: algoliaEnvData.indexName },
      {
        label: "Price (Low to High)",
        value: `${algoliaEnvData.indexName}_price_asc`,
      },
      {
        label: "Price (High to Low)",
        value: `${algoliaEnvData.indexName}_price_desc`,
      },
    ],
  });

  const { hierarchicalMenu, query } = uiState[algoliaEnvData.indexName];
  const slugArray = hierarchicalMenu?.["ep_slug_categories.lvl0"];

  const title = slugArray ? resolveTitle(slugArray, lookup) : "All Categories";

  return (
    <div className="mx-auto grid max-w-7xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pt-8">
        <div className="py-2">
          <span className="text-4xl font-bold">{title}</span>
          {query && (
            <span className="ml-4">Search results for &quot;{query}&quot;</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="block md:hidden">
            <button
              className="flex items-center justify-center gap-2 rounded-md px-4 py-2 text-base font-medium text-black transition-all duration-200 hover:bg-gray-100"
              onClick={() => setShowFilterMenu(true)}
            >
              Filter <ChevronDownIcon height={12} width={12} />
            </button>
            <MobileFilters
              lookup={lookup}
              NextRouterHandler={NextRouterHandler}
              showFilterMenu={showFilterMenu}
              setShowFilterMenu={setShowFilterMenu}
            />
          </div>
          <div className="py-2">
            <Popover className="relative">
              {({}) => (
                <>
                  <Popover.Button className="flex items-center justify-center gap-2 rounded-md px-4 py-2 text-base font-medium text-black transition-all duration-200 hover:bg-gray-100">
                    Sort <ChevronDownIcon height={12} width={12} />
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute right-0 z-10 mt-2 w-48 transform text-sm sm:px-0 xl:left-0 xl:right-auto">
                      <div className="z-60 flex flex-col items-start overflow-hidden rounded-md border bg-white py-2">
                        {options.map((option) => (
                          <Popover.Button
                            className="flex w-full items-start px-3 py-2 hover:bg-gray-100"
                            key={option.value}
                            onClick={() => refine(option.value)}
                          >
                            {option.label}
                          </Popover.Button>
                        ))}
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>
        </div>
      </div>
      <SearchBox />
      <hr />
      <div className="grid grid-cols-[auto_auto_auto] gap-8">
        <div className="hidden min-w-[14rem] md:block lg:min-w-[16rem]">
          <h3 className="font-semibold">Category</h3>
          <CustomHierarchicalMenu
            lookup={lookup}
            attributes={hierarchicalAttributes}
          />
          {/* TO-DO */}
          <PriceRangeSlider attribute={EP_ROUTE_PRICE} />
          <ProductSpecification />
        </div>

        <div>
          <Hits />
          <div className="py-10">
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  );
}

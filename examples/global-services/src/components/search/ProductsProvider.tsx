import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { FilterManager, KlevuFilterResultOptions, KlevuResponseObject, KlevuSearchOptions, KlevuSearchSorting } from "@klevu/core";
import { fetchProducts } from "../../lib/klevu";
import { usePathname, useSearchParams } from "next/navigation";
import { DEFAULT_LIMIT } from "./Pagination";
import { DEFAULT_MAX_VAL, DEFAULT_MIN_VAL } from "./price-range-slider/PriceRangeSlider";
import { Facet } from "./product-specification/Facets";

type ProductsSettings = {
  priceRange: number[];
  limit: number;
  offset: number;
  sortBy: KlevuSearchSorting.PriceAsc | KlevuSearchSorting.PriceDesc | undefined,
}

type SettingsKey = keyof ProductsSettings

interface ProductsState {
  page?: { data: KlevuResponseObject | undefined, loading: boolean };
  settings: ProductsSettings;
  adjustSettings: ((settings: Partial<ProductsSettings>) => void);
  facetClicked: (filter: KlevuFilterResultOptions, facet?: Facet) => void;
}

export const ProductsProviderContext = createContext<ProductsState | null>( null );

export type ProductsProviderProps = {
  children: React.ReactNode;
};

function searchSettings(productsSettings: ProductsSettings): Partial<KlevuSearchOptions> {
  const settings: Partial<KlevuSearchOptions> =  {
    limit: productsSettings.limit,
    typeOfRecords: ["KLEVU_PRODUCT"],
    offset: productsSettings.offset,
    sort: productsSettings.sortBy || undefined,
  };

  if(productsSettings.priceRange[0] !== DEFAULT_MIN_VAL || productsSettings.priceRange[1] !== DEFAULT_MAX_VAL) {
    settings.groupCondition = {
      groupOperator: "ANY_OF",
      conditions: [
        {
          key: "klevu_price",
          valueOperator: "INCLUDE",
          singleSelect: true,
          excludeValuesInResult: true,
          values: [
            `${productsSettings.priceRange[0]} - ${productsSettings.priceRange[1]}`
          ]
        }
      ]
    }
  }
  return settings;
}

function convertToTitleCase(text: string): string {
  return text
    .split('-') // Split the string by hyphens
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' '); // Join the words back together with spaces
}

const manager = new FilterManager();

export const ProductsProvider = ({
  children,
}: ProductsProviderProps) => {
  const [initRange, setInitRange] = useState<[Number, Number]>()
  const searchParams = useSearchParams();
  const DEFAULT_SETTINGS: ProductsSettings = {
    limit: Number(searchParams.get("limit")) || DEFAULT_LIMIT,
    offset: Number(searchParams.get("offset")) || 0,
    priceRange: [DEFAULT_MIN_VAL, DEFAULT_MAX_VAL],
    sortBy: undefined,
  }
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [page, setPage] = useState<{ data: KlevuResponseObject | undefined, loading: boolean }>({ data: undefined, loading: false});
  const pathname = usePathname();

  const fetchProductsData = async () => {
    try {
      const data = await fetchProducts(searchSettings(settings), undefined, manager);
      const priceRangeFilter: any = data.queriesById("search").filters?.find((filter) => filter.key === "klevu_price");
      if(!initRange) {
        setInitRange([priceRangeFilter.min, priceRangeFilter.max]);
        setPage({ data, loading: false });
      } else {
        priceRangeFilter.min = initRange[0];
        priceRangeFilter.max = initRange[1];
        setPage({ data, loading: false });
      }
      
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const adjustSettings = (newSettings: Partial<ProductsSettings>) => {
    const offset = newSettings.offset || 0;
    setSettings({...settings, ...newSettings, offset});
  }

  useEffect(() => {
    if(searchParams.get("offset")) {
      adjustSettings({ offset: Number(searchParams.get("offset")) });
    }
  }, [searchParams.get("offset")])

  const facetClicked = (filter: KlevuFilterResultOptions, facet?: Facet) => {
    if(facet?.selected) {
      manager.deselectOption(filter.key, facet.value);
    } else {
      if(facet && facet.name === "all") {
        filter.options.forEach((option) => {
          manager.deselectOption(filter.key, option.value);
        })
      }
      else if(facet) {
        manager.selectOption(filter.key, facet.value);
      }
    }
    setSettings({...settings, offset: 0})
  }

  useEffect(() => {
    if(manager && manager.filters?.length) {
      const filter = manager.filters[0] as KlevuFilterResultOptions
      filter.options.forEach((option) => manager.deselectOption("category", option.value))
    }
    const pathSegments = pathname.replace('/search', '').split('/').filter(Boolean);
    pathSegments.forEach((segment) => {
      manager.selectOption("category", convertToTitleCase(segment));
    });
  }, []);

  useEffect(() => {
    fetchProductsData();
  }, [settings]);

  return (
    <ProductsProviderContext.Provider value={{ page, settings, adjustSettings, facetClicked }}>
      {children}
    </ProductsProviderContext.Provider>
  );
};

export function usePageContext() {
  const context = useContext(ProductsProviderContext);
  if (context === null) {
    throw new Error("usePageContext must be used within a ProductsProvider");
  }
  return context?.page?.data?.queriesById("search");
}

export function useResponseObject() {
  const context = useContext(ProductsProviderContext);
  if (context === null) {
    throw new Error("useResponseObject must be used within a ProductsProvider");
  }
  return context?.page;
}

export function useFacetClicked() {
  const context = useContext(ProductsProviderContext);
  if (context === null) {
    throw new Error("facetClicked must be used within a ProductsProvider");
  }
  return context.facetClicked;
}

export function useSettings(key: SettingsKey) {
  const context = useContext(ProductsProviderContext);
  if (context === null) {
    throw new Error("settings must be used within a ProductsProvider");
  }

  const setSetting = (value: typeof context.settings[SettingsKey]) => {
    context.adjustSettings({ [key]: value });
  };

  return {
    [key]: context.settings[key],
    [`set${key.charAt(0).toUpperCase() + key.slice(1)}`]: setSetting
  };
}

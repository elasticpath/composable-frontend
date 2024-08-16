import { clsx } from "clsx";
import { useFacetClicked, usePageContext } from "./ProductsProvider";
import { KlevuFilterResultOptions } from "@klevu/core";
import { Facet } from "./product-specification/Facets";

function isPathActive(activePath: string, providedPath: string): boolean {
  const targetPathParts = activePath.split("/").filter(Boolean);
  const providedPathParts = providedPath.split("/").filter(Boolean);

  if (providedPathParts.length > targetPathParts.length) {
    return false;
  }

  return providedPathParts.every(
    (part, index) => part === targetPathParts[index],
  );
}

function MenuItem({ item, filter }: { item: KlevuFilterResultOptions | Facet, filter?: KlevuFilterResultOptions }): JSX.Element {
  const activeItem = 'selected' in item ? item.selected : false;
  const facetClicked = useFacetClicked();
  const label = 'label' in item ? item.label : item.name;
  const options = 'options' in item ? item.options : [];
  return (
    <li
      className={clsx(
        "ais-HierarchicalMenu-item cursor-pointer",
        activeItem && clsx("ais-HierarchicalMenu-item--selected"),
      )}
    >
       {filter && <label className="mr-2 cursor-pointer">
          <input
            className="mr-2"
            type="checkbox"
            checked={activeItem}
            onChange={() => {
              if(filter) facetClicked(filter, item as Facet)
              if(label === "All Products") facetClicked((item as any).categoryFilter, { name: "all" } as Facet)}
            }
          />
          {label}
        </label>
        }
        {!filter && <div
          onClick={() => {
            if(filter) facetClicked(filter, item as Facet)
            if(label === "All Products") facetClicked((item as any).categoryFilter, { name: "all" } as Facet)}
          }
          className={clsx(
            "ais-HierarchicalMenu-link",
            activeItem && clsx("font-bold text-brand-primary"),
          )}
        >
          {label}
        </div>}
      {!!options.length && (
        <div>
          <MenuList items={options} filter={item as KlevuFilterResultOptions} />
        </div>
      )}
    </li>
  );
}

function MenuList({ items, filter }: { items: KlevuFilterResultOptions[] | Facet[], filter?: KlevuFilterResultOptions }) {
  return (
    <ul className="ms-2 mt-2 grid list-none gap-2">
      {items.map((item) => (
        item ? <MenuItem key={'key' in item ? item.key : item.value} item={item} filter={filter} /> : <></>
      ))}
    </ul>
  );
}

function isSelectedFacet(options: KlevuFilterResultOptions[]) {
  return options?.some((option) => option?.options?.some((facet) => facet.selected))
}

export default function NodeMenu(): JSX.Element {
  const pageContext = usePageContext();
  const filters = pageContext?.filters || [];
  if(!filters.length) {
    return <></>
  }
  let categoryFilter = filters ? filters.find((filter) => filter.key === "category") : [];
  const navWithAllProducts = [
    {
      key: "all",
      label: "All Products",
      selected: !isSelectedFacet(filters as KlevuFilterResultOptions[]),
      categoryFilter
    } as any,
    categoryFilter,
  ];
  return (
    <div className={clsx("ais-HierarchicalMenu block")}>
      <MenuList items={navWithAllProducts} />
    </div>
  );
}

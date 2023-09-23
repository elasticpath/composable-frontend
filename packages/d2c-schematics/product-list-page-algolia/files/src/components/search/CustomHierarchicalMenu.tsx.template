import {
  useHierarchicalMenu,
  UseHierarchicalMenuProps,
} from "react-instantsearch-hooks-web";
import { clsx } from "clsx";
import { BreadcrumbLookup } from "../../lib/types/breadcrumb-lookup";
import { Unpacked } from "../../lib/types/unpacked";
import { MouseEvent, useEffect, useRef } from "react";
import NextLink from "next/link";

type HierarchicalListProps = Pick<
  ReturnType<typeof useHierarchicalMenu>,
  "items" | "createURL"
> & {
  onNavigate: (value: string) => void;
  lookup?: BreadcrumbLookup;
};

type HierarchicalListItemProps = Pick<
  ReturnType<typeof useHierarchicalMenu>,
  "createURL"
> & {
  onNavigate: (value: string) => void;
  lookup?: BreadcrumbLookup;
  item: Item;
};

type Item = Unpacked<ReturnType<typeof useHierarchicalMenu>["items"]>;

function HierarchicalItem({
  item,
  createURL,
  onNavigate,
  lookup,
}: HierarchicalListItemProps): JSX.Element {
  const path = item.value.replaceAll(" > ", "/");
  const label = lookup?.[`/${path}`]?.name ?? item.label;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && item.data) {
      inputRef.current.indeterminate = item.isRefined
        ? item.data.some((child) => child.isRefined)
        : false;
    }
  });

  return (
    <li
      className={clsx(
        "ais-HierarchicalMenu-item cursor-pointer",
        item.data && clsx("ais-HierarchicalMenu-item--parent"),
        item.isRefined && clsx("ais-HierarchicalMenu-item--selected")
      )}
    >
      <NextLink href={createURL(item.value)} passHref>
        <a
          className={clsx(
            "ais-HierarchicalMenu-link",
            item.isRefined && clsx("font-bold text-brand-primary")
          )}
          onClick={(event) => {
            if (isModifierClick(event)) return;
            event.preventDefault();
            onNavigate(item.value);
          }}
        >
          <input
            className="mr-2 cursor-pointer"
            type="checkbox"
            checked={item.isRefined}
            ref={inputRef}
            onChange={() => null}
          />
          {label}
        </a>
      </NextLink>

      {item.data?.length && (
        <div>
          <HierarchicalList
            items={item.data!}
            onNavigate={onNavigate}
            createURL={createURL}
            lookup={lookup}
          />
        </div>
      )}
    </li>
  );
}

function HierarchicalList({
  items,
  createURL,
  onNavigate,
  lookup,
}: HierarchicalListProps) {
  return (
    <ul className="ms-2 mt-2 grid list-none gap-2">
      {items.map((item) => (
        <HierarchicalItem
          key={item.value}
          createURL={createURL}
          onNavigate={onNavigate}
          lookup={lookup}
          item={item}
        />
      ))}
    </ul>
  );
}

type CustomUseHierarchicalMenuProps = UseHierarchicalMenuProps & {
  lookup?: BreadcrumbLookup;
};

export default function CustomHierarchicalMenu(
  props: CustomUseHierarchicalMenuProps
): JSX.Element {
  const { items, canRefine, refine, createURL } = useHierarchicalMenu(props);

  return (
    <div
      className={clsx(
        "ais-HierarchicalMenu",
        !canRefine && clsx("ais-HierarchicalMenu--noRefinement"),
        "none",
        items?.length > 0 && "block"
      )}
    >
      <HierarchicalList
        items={items}
        onNavigate={refine}
        createURL={createURL}
        lookup={props.lookup}
      />
    </div>
  );
}

function isModifierClick(event: MouseEvent) {
  const isMiddleClick = event.button === 1;

  return Boolean(
    isMiddleClick ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
  );
}

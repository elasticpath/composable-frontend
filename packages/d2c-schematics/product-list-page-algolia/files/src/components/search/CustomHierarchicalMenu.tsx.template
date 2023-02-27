import {
  useHierarchicalMenu,
  UseHierarchicalMenuProps,
} from "react-instantsearch-hooks-web";
import { clsx } from "clsx";
import { Box, Checkbox, Link, ListItem, UnorderedList } from "@chakra-ui/react";
import { BreadcrumbLookup } from "../../lib/types/breadcrumb-lookup";
import { Unpacked } from "../../lib/types/unpacked";
import { MouseEvent } from "react";
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

  return (
    <ListItem
      className={clsx(
        "ais-HierarchicalMenu-item",
        item.data && clsx("ais-HierarchicalMenu-item--parent"),
        item.isRefined && clsx("ais-HierarchicalMenu-item--selected")
      )}
    >
      <NextLink href={createURL(item.value)} passHref>
        <Link
          className={clsx("ais-HierarchicalMenu-link")}
          textColor={clsx(item.isRefined && "brand.primary")}
          fontWeight={clsx(item.isRefined && "bold")}
          onClick={(event) => {
            if (isModifierClick(event)) return;
            event.preventDefault();
            onNavigate(item.value);
          }}
          fontSize="sm"
        >
          <Checkbox
            isChecked={item.isRefined}
            isIndeterminate={
              item.isRefined && item.data?.some((child) => child.isRefined)
            }
          >
            {label}
          </Checkbox>
        </Link>
      </NextLink>

      {item.data?.length && (
        <Box>
          <HierarchicalList
            items={item.data!}
            onNavigate={onNavigate}
            createURL={createURL}
            lookup={lookup}
          />
        </Box>
      )}
    </ListItem>
  );
}

function HierarchicalList({
  items,
  createURL,
  onNavigate,
  lookup,
}: HierarchicalListProps) {
  return (
    <UnorderedList
      display="grid"
      gap={2}
      listStyleType="none"
      marginInlineStart={2}
      mt={2}
    >
      {items.map((item) => (
        <HierarchicalItem
          key={item.value}
          createURL={createURL}
          onNavigate={onNavigate}
          lookup={lookup}
          item={item}
        />
      ))}
    </UnorderedList>
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
    <Box
      display={clsx("none", items?.length > 0 && "block")}
      {...props}
      className={clsx(
        "ais-HierarchicalMenu",
        !canRefine && clsx("ais-HierarchicalMenu--noRefinement")
      )}
    >
      <HierarchicalList
        items={items}
        onNavigate={refine}
        createURL={createURL}
        lookup={props.lookup}
      />
    </Box>
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

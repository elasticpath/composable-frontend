import { clsx } from "clsx";
import { NavigationNode } from "@elasticpath/react-shopper-hooks";
import { usePathname } from "next/navigation";
import Link from "next/link";

type MenuItemProps = {
  item: NavigationNode;
};

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

function MenuItem({ item }: MenuItemProps): JSX.Element {
  const pathname = usePathname();
  const activeItem = isPathActive(pathname, `/search/${item.href}`);

  return (
    <li
      className={clsx(
        "ais-HierarchicalMenu-item cursor-pointer",
        item.children && clsx("ais-HierarchicalMenu-item--parent"),
        activeItem && clsx("ais-HierarchicalMenu-item--selected"),
      )}
    >
      <Link
        href={`/search/${item.href}`}
        className={clsx(
          "ais-HierarchicalMenu-link",
          activeItem && clsx("font-bold text-brand-primary"),
        )}
      >
        {item.name}
      </Link>
      {activeItem && !!item.children?.length && (
        <div>
          <MenuList items={item.children!} />
        </div>
      )}
    </li>
  );
}

type MenuListProps = {
  items: NavigationNode[];
};

function MenuList({ items }: MenuListProps) {
  return (
    <ul className="ms-2 mt-2 grid list-none gap-2">
      {items.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

type NodeMenuProps = {
  nav: NavigationNode[];
};

export default function NodeMenu({ nav }: NodeMenuProps): JSX.Element {
  const navWithAllProducts = [
    {
      id: "all",
      name: "All Products",
      href: "/",
      slug: "all-products",
      children: [],
    },
    ...nav,
  ];
  return (
    <div className={clsx("ais-HierarchicalMenu block")}>
      <MenuList items={navWithAllProducts} />
    </div>
  );
}

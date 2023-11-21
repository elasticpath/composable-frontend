"use client";
import { createBreadcrumb } from "../lib/create-breadcrumb";
import Link from "next/link";
import { useStore } from "@elasticpath/react-shopper-hooks";
import { buildBreadcrumbLookup } from "../lib/build-breadcrumb-lookup";
import { usePathname } from "next/navigation";

export default function Breadcrumb(): JSX.Element {
  const { nav } = useStore();
  const pathname = usePathname();
  const lookup = buildBreadcrumbLookup(nav ?? []);
  const nodes = pathname.replace("/search/", "")?.split("/");
  const crumbs = createBreadcrumb(nodes, lookup);

  return (
    <ol className="m-0 flex list-none gap-4">
      {crumbs.length > 1 &&
        crumbs.map((entry, index, array) => (
          <li className="text-xs md:text-sm" key={entry.breadcrumb}>
            {array.length === index + 1 ? (
              <span className="font-bold">{entry.label}</span>
            ) : (
              <Link
                href={`/search/${entry.breadcrumb}`}
                passHref
                className="text-gray-500 hover:text-brand-primary"
              >
                {entry.label}
              </Link>
            )}
            {array.length !== index + 1 && <span className="ml-4">/</span>}
          </li>
        ))}
    </ol>
  );
}

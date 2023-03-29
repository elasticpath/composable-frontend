import { BreadcrumbLookup } from "./types/breadcrumb-lookup";

export interface BreadcrumbEntry {
  value: string;
  breadcrumb: string;
  label: string;
}

export function createBreadcrumb(
  [head, ...tail]: string[],
  lookup?: BreadcrumbLookup,
  acc: BreadcrumbEntry[] = [],
  breadcrumb?: string
): BreadcrumbEntry[] {
  const updatedBreadcrumb = `${breadcrumb ? `${breadcrumb}/` : ""}${head}`;

  const label = lookup?.[`/${updatedBreadcrumb}`]?.name ?? head;

  const entry = {
    value: head,
    breadcrumb: updatedBreadcrumb,
    label,
  };
  if (!head) {
    return [];
  }
  if (tail.length < 1) {
    return [...acc, entry];
  }
  return createBreadcrumb(tail, lookup, [...acc, entry], updatedBreadcrumb);
}

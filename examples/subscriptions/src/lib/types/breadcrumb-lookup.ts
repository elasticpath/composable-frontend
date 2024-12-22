export interface BreadcrumbLookupEntry {
  href: string;
  name: string;
  slug: string;
}

export type BreadcrumbLookup = Record<string, BreadcrumbLookupEntry>;

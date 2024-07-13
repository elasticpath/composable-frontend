export function resolveIndexName(
  catalogName: string,
  catalogId: string,
): string {
  const escapedName = escapeCatalogName(catalogName)
  const resolvedId = catalogId.split("-")[0]

  return `${escapedName}_${resolvedId}`
}

function escapeCatalogName(catalogName: string): string {
  // Replace leading and trailing spaces and then replace spaces with underscores
  return catalogName.trim().replace(/\s/g, "_")
}

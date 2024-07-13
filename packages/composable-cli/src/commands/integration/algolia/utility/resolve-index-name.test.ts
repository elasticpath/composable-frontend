import { resolveIndexName } from "./resolve-index-name"

describe("resolveIndexName", () => {
  it("should resolve index name with escaped catalog name and first block of catalogId", () => {
    const catalogName = "Flora standard catalog"
    const catalogId = "7b479b7c-05b7-4a25-ae3a-dae4787b0811"

    const result = resolveIndexName(catalogName, catalogId)

    expect(result).toBe("Flora_standard_catalog_7b479b7c")
  })

  it("should handle catalog names with leading/trailing spaces", () => {
    const catalogName = "  Flora catalog with spaces  "
    const catalogId = "7b479b7c-05b7-4a25-ae3a-dae4787b0811"

    const result = resolveIndexName(catalogName, catalogId)

    expect(result).toBe("Flora_catalog_with_spaces_7b479b7c")
  })
})

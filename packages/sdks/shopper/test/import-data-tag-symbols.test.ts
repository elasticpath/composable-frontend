import { describe, expect, it } from "vitest"
import { importDataTagSymbols } from "../scripts/import-data-tag-symbols.mjs"

const emitted = `import { UseMutationOptions } from '@tanstack/react-query';
declare const getACartQueryKey: (options: Options) => [Key] & {
    [dataTagSymbol]: CartEntityResponse;
    [dataTagErrorSymbol]: ResponseErrorResponse;
};
`

describe("importDataTagSymbols", () => {
  it("imports both tag symbols from React Query when the declarations use them as keys", () => {
    expect(importDataTagSymbols(emitted)).toBe(
      `import { dataTagSymbol, dataTagErrorSymbol } from '@tanstack/react-query';\n${emitted}`,
    )
  })

  it("imports only the symbols the declarations use", () => {
    const onlyData = emitted.replace(/^.*dataTagErrorSymbol.*\n/m, "")

    expect(importDataTagSymbols(onlyData)).toBe(
      `import { dataTagSymbol } from '@tanstack/react-query';\n${onlyData}`,
    )
  })

  it("leaves declarations without tag keys unchanged", () => {
    const untagged = `declare const getACartQueryKey: (options: Options) => [Key];\n`

    expect(importDataTagSymbols(untagged)).toBe(untagged)
  })

  it("adds nothing when the symbols are already imported, so a second run is a no-op", () => {
    const once = importDataTagSymbols(emitted)

    expect(importDataTagSymbols(once)).toBe(once)
  })
})

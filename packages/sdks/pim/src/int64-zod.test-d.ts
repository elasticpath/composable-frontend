import { describe, expectTypeOf, it } from "vitest"
import type { z } from "zod"
import type { GetAllProductsData } from "./index"
import { zGetAllProductsQuery, zPageLimit, zPageOffset } from "./zod"

type GetAllProductsQuery = NonNullable<GetAllProductsData["query"]>

describe("int64 in /zod", () => {
  it("infers zPageOffset and zPageLimit as number", () => {
    expectTypeOf<z.infer<typeof zPageOffset>>().toEqualTypeOf<number>()
    expectTypeOf<z.infer<typeof zPageLimit>>().toEqualTypeOf<number>()
  })

  it("infers the page parameters of a list query as the operation's types", () => {
    expectTypeOf<
      z.infer<typeof zGetAllProductsQuery>["page[offset]"]
    >().toEqualTypeOf<GetAllProductsQuery["page[offset]"]>()
    expectTypeOf<
      z.infer<typeof zGetAllProductsQuery>["page[limit]"]
    >().toEqualTypeOf<GetAllProductsQuery["page[limit]"]>()
  })
})

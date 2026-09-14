import { NextResponse } from "next/server"
import { z } from "zod"
import { getSavedListContext } from "@/lib/saved-list-context"
import { listSavedProducts, saveProduct } from "@/lib/saved-list"

/**
 * The saved list API.
 *
 * Nothing here takes an account id from the request. `getSavedListContext`
 * reads it from the signed session cookie, and `saved-list.ts` refuses to act
 * without it. A request body can only ever name a product.
 */

const addSchema = z.object({
  productId: z.string().min(1),
})

export async function GET() {
  const context = await getSavedListContext()

  if (!context.ok) {
    return NextResponse.json(
      { error: context.message },
      { status: context.status },
    )
  }

  const entries = await listSavedProducts(context.store, context.accountId)

  return NextResponse.json({
    data: entries.map((entry) => ({
      entryId: entry.id,
      productId: entry.product_id,
    })),
  })
}

export async function POST(request: Request) {
  const context = await getSavedListContext()

  if (!context.ok) {
    return NextResponse.json(
      { error: context.message },
      { status: context.status },
    )
  }

  const body = addSchema.safeParse(await request.json().catch(() => null))

  if (!body.success) {
    return NextResponse.json({ error: "Expected a productId" }, { status: 400 })
  }

  const entry = await saveProduct(
    context.store,
    context.accountId,
    body.data.productId,
  )

  return NextResponse.json(
    { data: { entryId: entry.id, productId: entry.product_id } },
    { status: 201 },
  )
}

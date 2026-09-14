import { NextResponse } from "next/server"
import { z } from "zod"
import {
  contextErrorResponse,
  getSavedListContext,
} from "@/lib/saved-list-context"
import {
  UnsafeIdentifierError,
  listSavedProducts,
  saveProduct,
} from "@/lib/saved-list"

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
    return contextErrorResponse(context)
  }

  try {
    const entries = await listSavedProducts(context.store, context.accountId)

    return NextResponse.json({
      data: entries.map((entry) => ({
        entryId: entry.id,
        productId: entry.product_id,
      })),
    })
  } catch (error) {
    return failed(error)
  }
}

export async function POST(request: Request) {
  const context = await getSavedListContext()

  if (!context.ok) {
    return contextErrorResponse(context)
  }

  const body = addSchema.safeParse(await request.json().catch(() => null))

  if (!body.success) {
    return NextResponse.json({ error: "Expected a productId" }, { status: 400 })
  }

  try {
    const entry = await saveProduct(
      context.store,
      context.accountId,
      body.data.productId,
    )

    return NextResponse.json(
      { data: { entryId: entry.id, productId: entry.product_id } },
      { status: 201 },
    )
  } catch (error) {
    return failed(error)
  }
}

/**
 * Turns a thrown error into a reply. An identifier the saved list refused is
 * the caller's fault; anything else is ours, and its detail stays in the log.
 */
function failed(error: unknown): NextResponse {
  if (error instanceof UnsafeIdentifierError) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  console.error(error)
  return NextResponse.json({ error: "Saved list unavailable" }, { status: 500 })
}

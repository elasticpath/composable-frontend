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

function failed(error: unknown): NextResponse {
  if (error instanceof UnsafeIdentifierError) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  console.error(error)
  return NextResponse.json({ error: "Saved list unavailable" }, { status: 500 })
}

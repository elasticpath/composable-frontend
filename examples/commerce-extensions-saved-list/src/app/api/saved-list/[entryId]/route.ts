import { NextResponse } from "next/server"
import { getSavedListContext } from "@/lib/saved-list-context"
import { removeSavedProduct } from "@/lib/saved-list"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ entryId: string }> },
) {
  const context = await getSavedListContext()

  if (!context.ok) {
    return NextResponse.json(
      { error: context.message },
      { status: context.status },
    )
  }

  const { entryId } = await params
  const result = await removeSavedProduct(
    context.store,
    context.accountId,
    entryId,
  )

  if (!result.removed) {
    // Someone else's entry answers the same way one that does not exist does.
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}

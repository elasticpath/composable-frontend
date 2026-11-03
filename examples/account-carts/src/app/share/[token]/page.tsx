import Link from "next/link"
import { AcceptShareButton } from "@/components/accept-share-button"
import { requireCartContext } from "@/lib/cart-context"
import { NOT_ANSWERING_MESSAGE, shareUnavailableMessage } from "@/lib/messages"
import { CartsUnavailableError } from "@/lib/carts-port"
import {
  SHARE_UNAVAILABLE_MESSAGE,
  openShare,
  type OpenedShare,
} from "@/lib/open-share"
import { shareLinkPath } from "@/lib/share-link"
import { shareSource } from "@/lib/share-source"
import { SharesUnavailableError } from "@/lib/shares-store"

export const dynamic = "force-dynamic"

type Opened = OpenedShare | { status: "problem"; message: string }

async function open(token: string): Promise<Opened> {
  try {
    return await openShare(shareSource, token)
  } catch (error) {
    if (error instanceof SharesUnavailableError) {
      return {
        status: "problem",
        message: shareUnavailableMessage(error.reason),
      }
    }

    if (error instanceof CartsUnavailableError) {
      console.error(error)
      return { status: "problem", message: NOT_ANSWERING_MESSAGE }
    }

    throw error
  }
}

function Message({ children }: { children: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium">Shared cart</h1>
      <p className="text-sm text-gray-700">{children}</p>
      <Link href="/" className="text-sm text-blue-600 underline">
        Browse products
      </Link>
    </div>
  )
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  await requireCartContext(shareLinkPath(encodeURIComponent(token)))

  const opened = await open(token)

  if (opened.status === "problem") {
    return <Message>{opened.message}</Message>
  }

  if (opened.status === "unavailable") {
    return <Message>{SHARE_UNAVAILABLE_MESSAGE}</Message>
  }

  const { cart } = opened

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Shared cart</h1>
        <p className="mt-1 text-sm text-gray-600">
          Someone shared this cart with you. Adding it puts these items in your
          current cart, next to what is already there. The shared cart does not
          change.
        </p>
      </div>

      <div className="rounded border border-gray-200 bg-white">
        <ul className="divide-y divide-gray-200">
          {cart.lines.map((line) => (
            <li
              key={line.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <p className="wrap-anywhere font-medium">{line.name}</p>
                <p className="text-xs text-gray-500">
                  Quantity {line.quantity}
                </p>
              </div>
              <p className="text-sm">{line.lineTotal}</p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-gray-200 p-4 font-medium">
          <span>Total</span>
          <span>{cart.total}</span>
        </div>
      </div>

      <AcceptShareButton token={token} />
    </div>
  )
}

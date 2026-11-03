import type { CartsPort } from "@/lib/cart-service"
import { shareUnavailableMessage } from "@/lib/messages"
import { listShareLinks, type ShareLink } from "@/lib/shared-carts"
import { SharesUnavailableError, openShareStore } from "@/lib/shares-store"
import { ShareLinkRow } from "./share-link-row"

type Loaded =
  | { status: "loaded"; links: ShareLink[] }
  | { status: "unavailable"; message: string }

async function loadShareLinks(
  port: CartsPort,
  accountId: string,
): Promise<Loaded> {
  try {
    const store = await openShareStore()
    return {
      status: "loaded",
      links: await listShareLinks(port, store, accountId),
    }
  } catch (error) {
    if (error instanceof SharesUnavailableError) {
      return {
        status: "unavailable",
        message: shareUnavailableMessage(error.reason),
      }
    }

    console.error(error)
    return {
      status: "unavailable",
      message: shareUnavailableMessage("unreachable"),
    }
  }
}

export async function ShareLinks({
  port,
  accountId,
}: {
  port: CartsPort
  accountId: string
}) {
  const shares = await loadShareLinks(port, accountId)

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-medium">Share links</h2>
        <p className="mt-1 text-sm text-gray-600">
          Anyone with a link can see the cart it points to. A link holds a
          random token, never the cart&apos;s id. Revoke a link to stop it
          working.
        </p>
      </div>

      {shares.status === "unavailable" ? (
        <p className="text-sm text-red-600">{shares.message}</p>
      ) : shares.links.length === 0 ? (
        <p className="text-sm text-gray-600">
          You have not shared a cart. Choose Share on a saved cart to make a
          link.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
          {shares.links.map((link) => (
            <ShareLinkRow key={link.entryId} {...link} />
          ))}
        </ul>
      )}
    </section>
  )
}

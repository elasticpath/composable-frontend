import { CART_GONE_MESSAGE, NOT_ANSWERING_MESSAGE } from "./cart-messages"
import { CartsUnavailableError } from "./carts-port"

export type CartAction = "rename" | "delete" | "resume"

const LAST_CART_TITLE = "Last cart"

const LAST_CART_MESSAGE =
  "That was the only cart in your account, so Elastic Path would not delete it. Try again."

const NOT_ALLOWED_MESSAGE = "Your account is not allowed to change that cart."

const RATE_LIMITED_MESSAGE =
  "Elastic Path is busy. Wait a moment and try again."

const NAME_REFUSED_MESSAGE =
  "Elastic Path would not accept that name. Try a different one."

const REFUSED_BY_ACTION: Record<CartAction, string> = {
  rename: "Elastic Path would not rename that cart. Try again.",
  delete: "Elastic Path would not delete that cart. Try again.",
  resume: "Elastic Path would not open that cart. Try again.",
}

type Refusal = { status: number; title: string | undefined }

function toRefusal(item: unknown): Refusal | undefined {
  if (typeof item !== "object" || item === null) return undefined

  const { status, title } = item as { status?: unknown; title?: unknown }
  const numeric = Number(status)
  if (!Number.isInteger(numeric)) return undefined

  return {
    status: numeric,
    title: typeof title === "string" ? title : undefined,
  }
}

function refusalIn(cause: unknown): Refusal | undefined {
  if (typeof cause !== "object" || cause === null) return undefined

  const { errors } = cause as { errors?: unknown }
  if (Array.isArray(errors)) return toRefusal(errors[0])

  return toRefusal(cause)
}

export function describeFailure(error: unknown, action: CartAction): string {
  const refusal =
    error instanceof CartsUnavailableError ? refusalIn(error.cause) : undefined

  if (!refusal) return NOT_ANSWERING_MESSAGE

  if (refusal.status >= 500) return NOT_ANSWERING_MESSAGE
  if (refusal.status === 404) return CART_GONE_MESSAGE
  if (refusal.status === 403) return NOT_ALLOWED_MESSAGE
  if (refusal.status === 429) return RATE_LIMITED_MESSAGE

  if (refusal.status === 400 && refusal.title === LAST_CART_TITLE) {
    return LAST_CART_MESSAGE
  }

  const invalidRequest = refusal.status === 400 || refusal.status === 422
  if (invalidRequest && action === "rename") return NAME_REFUSED_MESSAGE

  return REFUSED_BY_ACTION[action]
}

export type CartCandidate = {
  id: string
  updatedAt: string | undefined
  isQuote: boolean
}

export type ActiveCartChoice =
  | { kind: "existing"; cartId: string }
  | { kind: "create" }

function updatedTime(cart: CartCandidate): number {
  const time = cart.updatedAt ? Date.parse(cart.updatedAt) : Number.NaN
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time
}

export function byMostRecentlyUpdated(
  a: CartCandidate,
  b: CartCandidate,
): number {
  return updatedTime(b) - updatedTime(a)
}

export function chooseActiveCart({
  cookieCartId,
  carts,
}: {
  cookieCartId: string | undefined
  carts: readonly CartCandidate[]
}): ActiveCartChoice {
  const shoppable = carts.filter((cart) => !cart.isQuote)

  const held = shoppable.find((cart) => cart.id === cookieCartId)
  if (held) {
    return { kind: "existing", cartId: held.id }
  }

  const [mostRecent] = [...shoppable].sort(byMostRecentlyUpdated)

  return mostRecent
    ? { kind: "existing", cartId: mostRecent.id }
    : { kind: "create" }
}

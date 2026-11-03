export type DeletionPlan = {
  disassociateFirst: boolean
  createReplacement: boolean
}

export function chooseDeletion({
  carts,
  cartId,
}: {
  carts: readonly { id: string; isQuote: boolean }[]
  cartId: string
}): DeletionPlan {
  const others = carts.filter((cart) => cart.id !== cartId)

  return {
    disassociateFirst: others.length === 0,
    createReplacement: others.every((cart) => cart.isQuote),
  }
}

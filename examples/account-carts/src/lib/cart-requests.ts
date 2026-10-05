export const CART_NAME = "Cart"

export const ACCOUNT_TOKEN_HEADER = "EP-Account-Management-Authentication-Token"

export type CartHeaders = {
  Authorization: string
  [ACCOUNT_TOKEN_HEADER]: string
}

export function cartHeaders({
  implicitToken,
  accountToken,
}: {
  implicitToken: string
  accountToken: string
}): CartHeaders {
  return {
    Authorization: `Bearer ${implicitToken}`,
    [ACCOUNT_TOKEN_HEADER]: accountToken,
  }
}

export function createCartRequest({
  headers,
  name = CART_NAME,
}: {
  headers: CartHeaders
  name?: string
}) {
  return { headers, body: { data: { name } } }
}

export function associateCartRequest({
  headers,
  cartId,
  accountId,
}: {
  headers: CartHeaders
  cartId: string
  accountId: string
}) {
  return {
    headers,
    path: { cartID: cartId },
    body: { data: [{ type: "account", id: accountId }] },
  }
}

export function deleteCartRequest({
  headers,
  cartId,
}: {
  headers: CartHeaders
  cartId: string
}) {
  return { headers, path: { cartID: cartId } }
}

export function disassociateCartRequest({
  headers,
  cartId,
  accountId,
}: {
  headers: CartHeaders
  cartId: string
  accountId: string
}) {
  return associateCartRequest({ headers, cartId, accountId })
}

export function renameCartRequest({
  headers,
  cartId,
  name,
}: {
  headers: CartHeaders
  cartId: string
  name: string
}) {
  return { headers, path: { cartID: cartId }, body: { data: { name } } }
}

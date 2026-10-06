import type { SchemaNode } from "./read-write-split"

function allowOrderItemsWithoutAProduct(orderItem: SchemaNode) {
  const properties = orderItem.properties as SchemaNode
  delete (properties.product_id as SchemaNode).format
}

export const cartCheckoutServiceCorrections: Record<
  string,
  (schema: SchemaNode) => void
> = {
  OrderItemResponse: allowOrderItemsWithoutAProduct,
}

import {
  ElasticPathFile,
  OrderItemResponse,
  OrderResponse,
  RelationshipItem,
} from "@epcc-sdk/sdks-shopper";

export function resolveShopperOrder(
  data: OrderResponse[],
  items: OrderItemResponse[],
  imageFilesMap: Record<string, ElasticPathFile> = {},
): { raw: OrderResponse; items: OrderItemResponse[]; mainImage?: string }[] {
  // Create a map of included items by their id
  const itemMap = items.reduce(
    (acc, item) => {
      return { ...acc, [item.id!]: item };
    },
    {} as Record<string, OrderItemResponse>,
  );

  // Map the items in the data array to their corresponding included items
  return data.map((order) => {
    const orderItems = order.relationships?.items?.data
      ? resolveOrderItemsFromRelationship(
          order.relationships.items.data,
          itemMap,
        )
      : [];

    return {
      raw: order,
      items: orderItems,
      mainImage:
        orderItems[0]?.product_id &&
        imageFilesMap[orderItems[0]?.product_id]?.link?.href,
    };
  });
}

function resolveOrderItemsFromRelationship(
  itemRelationships: Array<RelationshipItem>,
  itemMap: Record<string, OrderItemResponse>,
): OrderItemResponse[] {
  return itemRelationships?.reduce((orderItems, itemRel) => {
    const includedItem: OrderItemResponse | undefined = itemMap[itemRel.id!];
    return [...orderItems, ...(includedItem ? [includedItem] : [])];
  }, [] as OrderItemResponse[]);
}

import type {
  BulkAddItemsRequest,
  ResponseErrorResponse,
} from "@epcc-sdk/sdks-shopper";
import type { SelectedProduct } from "./bulk-selection";

export const QUANTITY_PER_SELECTED_PRODUCT = 1;

export function buildBulkAddRequest(productIds: string[]): BulkAddItemsRequest {
  return {
    data: [...new Set(productIds)].map((id) => ({
      type: "cart_item" as const,
      id,
      quantity: QUANTITY_PER_SELECTED_PRODUCT,
    })),
    options: { add_all_or_nothing: true },
  };
}

export type BulkAddFailure = {
  summary: string;
  problems: string[];
};

export function describeBulkAddFailure({
  error,
  products,
}: {
  error: ResponseErrorResponse | undefined;
  products: SelectedProduct[];
}): BulkAddFailure {
  const refusals = error?.errors ?? [];
  const cartRefusedTheRequest =
    refusals.length > 0 && refusals.every(({ status }) => isClientError(status));

  if (!cartRefusedTheRequest) {
    return {
      summary: "We could not confirm whether your cart changed. Check it before trying again.",
      problems: [],
    };
  }

  const nameById = new Map(
    products.map(({ productId, productName }) => [productId, productName]),
  );

  return {
    summary: "Nothing was added to your cart.",
    problems: refusals.map(({ title, meta }) => {
      const productName =
        (meta?.id && nameById.get(meta.id)) || "A selected product";
      return `${productName}: ${title}`;
    }),
  };
}

function isClientError(status: number): boolean {
  return status >= 400 && status < 500;
}

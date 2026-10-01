export type SelectableCard =
  | { selectable: true; productId: string }
  | { selectable: false; reason: string };

export function resolveSelectableProduct({
  productTypes,
  productId,
  selectedVariantId,
}: {
  productTypes: unknown;
  productId: string;
  selectedVariantId?: string;
}): SelectableCard {
  const productType = Array.isArray(productTypes) ? productTypes[0] : undefined;

  switch (productType) {
    case "standard":
      return { selectable: true, productId };
    case "parent":
      return selectedVariantId
        ? { selectable: true, productId: selectedVariantId }
        : { selectable: false, reason: "Choose options to select" };
    case "bundle":
      return {
        selectable: false,
        reason: "Bundles are configured on their product page",
      };
    default:
      return { selectable: false, reason: "Not available to select" };
  }
}

export type SelectedProduct = {
  cardId: string;
  productId: string;
  productName?: string;
};

export type BulkSelection = {
  resultsKey?: string;
  products: SelectedProduct[];
};

export type BulkSelectionAction =
  | ({ type: "toggle"; resultsKey: string } & SelectedProduct)
  | { type: "productChanged"; cardId: string; productId: string | undefined }
  | { type: "resultsChanged"; resultsKey: string }
  | { type: "added" };

export const emptyBulkSelection: BulkSelection = { products: [] };

export function bulkSelectionReducer(
  state: BulkSelection,
  action: BulkSelectionAction,
): BulkSelection {
  switch (action.type) {
    case "toggle": {
      const { type, resultsKey, ...toggled } = action;
      const current = state.resultsKey === resultsKey ? state.products : [];
      return {
        resultsKey,
        products: current.some((product) => product.cardId === toggled.cardId)
          ? current.filter((product) => product.cardId !== toggled.cardId)
          : [...current, toggled],
      };
    }
    case "productChanged": {
      const { cardId, productId } = action;
      if (!state.products.some((product) => product.cardId === cardId)) {
        return state;
      }
      return {
        ...state,
        products:
          productId === undefined
            ? state.products.filter((product) => product.cardId !== cardId)
            : state.products.map((product) =>
                product.cardId === cardId ? { ...product, productId } : product,
              ),
      };
    }
    case "resultsChanged":
      return state.resultsKey === action.resultsKey
        ? state
        : { resultsKey: action.resultsKey, products: [] };
    case "added":
      return { ...state, products: [] };
  }
}

export function selectedProducts(
  state: BulkSelection,
  resultsKey: string,
): SelectedProduct[] {
  return state.resultsKey === resultsKey ? state.products : [];
}

export function selectedProductIds(
  state: BulkSelection,
  resultsKey: string,
): string[] {
  return selectedProducts(state, resultsKey).map(({ productId }) => productId);
}

export function isCardSelected(
  state: BulkSelection,
  resultsKey: string,
  cardId: string,
): boolean {
  return selectedProducts(state, resultsKey).some(
    (product) => product.cardId === cardId,
  );
}

export function canAddSelection({
  productIds,
  isAdding,
}: {
  productIds: string[];
  isAdding: boolean;
}): boolean {
  return productIds.length > 0 && !isAdding;
}

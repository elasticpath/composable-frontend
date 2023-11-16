import { CartState, PresentCartState } from "@elasticpath/react-shopper-hooks";
import { ICart } from "../components/cart/Cart";
import { getPresentCartState } from "@elasticpath/react-shopper-hooks";

export function resolveShoppingCartProps(
  state: CartState,
  removeCartItem: (itemId: string) => Promise<void>,
): ICart | undefined {
  /**
   * Checking if the current cart state is a present cart or updating with a previous state of present cart
   * as in both cases we want to show cart items
   */
  const resolvePresentCartState: PresentCartState | undefined =
    getPresentCartState(state);

  if (resolvePresentCartState) {
    const { id, withTax, withoutTax, groupedItems, items } =
      resolvePresentCartState;
    return {
      id,
      totalPrice: withTax,
      subtotal: withoutTax,
      items,
      groupedItems: groupedItems,
      removeCartItem: removeCartItem,
    };
  }
  return;
}

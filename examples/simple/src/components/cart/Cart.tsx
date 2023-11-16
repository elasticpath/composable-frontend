import {
  GroupedCartItems,
  RefinedCartItem,
} from "@elasticpath/react-shopper-hooks";
import { CartItemList } from "./CartItemList";
import { CartOrderSummary } from "./CartOrderSummary";
import { ReadonlyNonEmptyArray } from "../../lib/types/read-only-non-empty-array";

export interface ICart {
  id: string;
  items: ReadonlyNonEmptyArray<RefinedCartItem>;
  groupedItems: GroupedCartItems;
  totalPrice: string;
  subtotal: string;
  removeCartItem: (itemId: string) => Promise<void>;
}

export default function Cart({
  id,
  items,
  groupedItems,
  totalPrice,
  subtotal,
  removeCartItem,
}: ICart): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-12">
      <CartItemList items={items} handleRemoveItem={removeCartItem} />
      <CartOrderSummary
        cartId={id}
        handleRemoveItem={removeCartItem}
        promotionItems={groupedItems.promotion}
        totalPrice={totalPrice}
        subtotal={subtotal}
      />
    </div>
  );
}

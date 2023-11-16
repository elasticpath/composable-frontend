import { PromotionCartItem } from "@elasticpath/react-shopper-hooks";
import { Promotion } from "./Promotion";
import Link from "next/link";

export function CartOrderSummary({
  cartId,
  totalPrice,
  subtotal,
  promotionItems,
  handleRemoveItem,
}: {
  cartId: string;
  totalPrice: string;
  subtotal: string;
  promotionItems: PromotionCartItem[];
  handleRemoveItem: (itemId: string) => Promise<void>;
}): JSX.Element {
  return (
    <div className="rounded-md bg-gray-50 p-8">
      <span className="text-lg font-medium">Order Summary</span>
      <table className="mr-6 mt-4 table-fixed">
        <tbody>
          <tr className="h-14 border-b text-sm">
            <td className="w-full pl-0 text-gray-600">Subtotal</td>
            <td className="text-right">{subtotal}</td>
          </tr>
          {/* Couldn't find any promotional items */}
          {promotionItems?.map((item) => {
            return (
              <tr className="h-14 border-b text-sm" key={item.id}>
                <td className="w-full pl-0 text-gray-600">
                  <div className="flex items-start">
                    <span>Discount</span>
                    <span className="text-red-600">{item.sku}</span>
                  </div>
                </td>
                <td className="text-right">
                  {promotionItems && promotionItems.length > 0 ? (
                    <div className="flex items-end">
                      <span>
                        {
                          promotionItems[0].meta.display_price.without_tax.unit
                            .formatted
                        }
                      </span>
                      <button
                        className="mt-0 p-0 hover:text-red-600"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    "$0.00"
                  )}
                </td>
              </tr>
            );
          })}
          <tr className="h-14 font-semibold">
            <td className="w-full pl-0">Order Total</td>
            <td className="text-right">{totalPrice}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-5">
        <Promotion />
      </div>
      <div className="mt-5 flex justify-evenly gap-2">
        <Link href="/" passHref legacyBehavior>
          <button className="secondary-btn">Continue Shopping</button>
        </Link>
        <Link href={`/checkout/${cartId}`} passHref legacyBehavior>
          <button className="primary-btn">Checkout</button>
        </Link>
      </div>
    </div>
  );
}

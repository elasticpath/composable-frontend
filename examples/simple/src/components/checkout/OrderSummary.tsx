import {
  PromotionCartItem,
  RefinedCartItem,
} from "@elasticpath/react-shopper-hooks";
import { NonEmptyArray } from "../../lib/types/non-empty-array";
import { ReadonlyNonEmptyArray } from "../../lib/types/read-only-non-empty-array";
import Link from "next/link";
import Image from "next/image";

interface IOrderSummary {
  items:
    | RefinedCartItem[]
    | NonEmptyArray<RefinedCartItem>
    | ReadonlyNonEmptyArray<RefinedCartItem>;
  promotionItems: PromotionCartItem[];
  totalPrice: string;
  subtotal: string;
}

export function OrderSummary({
  items,
  promotionItems,
  totalPrice,
  subtotal,
}: IOrderSummary): JSX.Element {
  return (
    <div className="rounded-md bg-gray-50 p-8">
      <span className="text-lg font-medium">Order Summary</span>
      {items.map((item) => (
        <div className="my-4 grid grid-cols-[auto_1fr] gap-3" key={item.id}>
          <div className="relative cursor-pointer bg-[#f6f7f9] w-[5rem] h-[5rem] rounded-lg">
            {item.image?.href && (
              <Link href={`/products/${item.product_id}`} legacyBehavior>
                <Image
                  className="rounded-lg"
                  src={item.image.href}
                  alt={item.name}
                  sizes="(max-width: 80px)"
                  fill
                  style={{
                    objectFit: "contain",
                    objectPosition: "center",
                  }}
                />
              </Link>
            )}
          </div>
          <div className="flex flex-col">
            <span className="mb-1 text-sm font-medium lg:text-base">
              {item.name}
            </span>
            <span className="mb-1 text-sm lg:text-base">
              {item.meta.display_price.without_tax.value.formatted}
            </span>
            <span className="text-xs font-light lg:text-sm">
              Qty {item.quantity}
            </span>
          </div>
        </div>
      ))}
      <hr />
      <table className="mt-4 table-fixed">
        <tbody>
          <tr className="h-14 border-b text-sm">
            <td className="w-full pl-0 text-gray-600">Subtotal</td>
            <td className="text-right">{subtotal}</td>
          </tr>
          {/* Promotional items, unsure */}
          <tr className="h-14 border-b text-sm">
            <td className="w-full pl-0 text-gray-600">
              <div className="flex items-start">
                <span>Discount</span>
                {promotionItems && promotionItems.length > 0 && (
                  <span className="text-red-600">
                    ( {promotionItems[0].sku} )
                  </span>
                )}
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
                  <button className="mt-0 p-0 hover:text-red-600">
                    Remove
                  </button>
                </div>
              ) : (
                "$0.00"
              )}
            </td>
          </tr>
          <tr className="h-14 font-semibold">
            <td className="w-full pl-0">Order Total</td>
            <td className="text-right">{totalPrice}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

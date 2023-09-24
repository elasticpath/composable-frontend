import { RefinedCartItem } from "@elasticpath/react-shopper-hooks";
import QuantityHandler from "../quantity-handler/QuantityHandler";
import { NonEmptyArray } from "../../lib/types/non-empty-array";
import { ReadonlyNonEmptyArray } from "../../lib/types/read-only-non-empty-array";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/solid";

export function CartItemList({
  items,
  handleRemoveItem,
}: {
  items:
    | RefinedCartItem[]
    | NonEmptyArray<RefinedCartItem>
    | ReadonlyNonEmptyArray<RefinedCartItem>;
  handleRemoveItem: (itemId: string) => Promise<void>;
}): JSX.Element {
  return (
    <div>
      {items.map((item) => (
        <div
          className="grid grid-flow-col grid-cols-[4fr_5fr_3fr_1fr] gap-8 border-b py-10 first:border-t first:border-gray-200 last:border-b-0"
          key={item.id}
        >
          <div>
            {item.image?.href && (
              <Image
                className="h-[5rem] w-[5rem] max-w-[4rem] overflow-hidden rounded-lg object-cover sm:h-[12rem] sm:w-[12rem]"
                src={item.image.href}
                alt={item.name}
                width={192}
                height={192}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="line-clamp-2 text-sm font-medium">
              {item.name}
            </span>
            <span className="text-md font-medium">
              {item.meta.display_price.without_tax.unit.formatted}
            </span>
          </div>
          <QuantityHandler item={item} />
          <XMarkIcon
            className="mt-1 cursor-pointer fill-gray-500 hover:fill-gray-800"
            aria-label="Remove"
            height={24}
            width={24}
            onClick={() => {
              handleRemoveItem(item.id);
            }}
          />
        </div>
      ))}
    </div>
  );
}

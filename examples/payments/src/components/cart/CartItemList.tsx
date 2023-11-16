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
          className="flex flex-row w-full flex-wrap gap-8 border-b py-10 first:border-t first:border-gray-200 last:border-b-0"
          key={item.id}
        >
          <div className="flex-none relative bg-[#f6f7f9] w-[5rem] h-[5rem] rounded-lg sm:w-[8rem] sm:h-[8rem] lg:w-[10rem] lg:h-[10rem]">
            {item.image?.href && (
              <Image
                src={item.image.href}
                alt={item.name}
                className="rounded-lg"
                sizes="(max-width: 192px)"
                fill
                style={{
                  objectFit: "contain",
                  objectPosition: "center",
                }}
              />
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <span className="line-clamp-2 text-sm font-medium">
              {item.name}
            </span>
            <span className="text-md font-medium">
              {item.meta.display_price.without_tax.unit.formatted}
            </span>
          </div>
          <div className="flex flex-none">
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
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";
import { getPresentCartState, useCart } from "@elasticpath/react-shopper-hooks";
import {
  CartState,
  CustomCartItem,
  RefinedCartItem,
  RegularCartItem,
} from "@elasticpath/react-shopper-hooks";
import { XMarkIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";
import { ReadonlyNonEmptyArray } from "../../../lib/types/read-only-non-empty-array";

function resolveStateCartItems(
  state: CartState,
): ReadonlyNonEmptyArray<RefinedCartItem> | undefined {
  const presentCartState = getPresentCartState(state);
  return presentCartState && presentCartState.items;
}

function ModalCartItem({
  item,
  handleRemove,
  onClose,
}: {
  item: CustomCartItem | RegularCartItem;
  handleRemove: (itemId: string) => void;
  onClose: () => void;
}): JSX.Element {
  const [removing, setRemoving] = useState(false);

  return (
    <div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-4">
        {item.image?.href && (
          <div className="relative w-16 h-16 bg-[#f6f7f9] rounded-lg">
            <Link
              href={`/products/${item.product_id}`}
              passHref
              onClick={() => onClose()}
            >
              {" "}
              <Image
                src={item.image.href}
                alt={item.name}
                sizes="(max-width: 64px)"
                fill
                className="overflow-hidden rounded-lg"
                style={{
                  objectFit: "contain",
                  objectPosition: "center",
                }}
              ></Image>
            </Link>
          </div>
        )}
        <div className="flex flex-col">
          <Link
            href={`/products/${item.product_id}`}
            passHref
            onClick={() => onClose()}
            className="line-clamp-2 text-sm font-semibold hover:underline"
          >
            {item.name}
          </Link>
          <span className="text-sm font-semibold">
            {item.meta.display_price.without_tax.value.formatted}
          </span>
          <span className="text-sm">Qty {item.quantity}</span>
        </div>
        <button className="relative">
          {removing ? (
            <svg
              aria-hidden="true"
              className="absolute right-0 top-0 h-4 w-4 animate-spin fill-brand-primary text-gray-200 dark:text-gray-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          ) : (
            <XMarkIcon
              onClick={async () => {
                setRemoving(true);
                await handleRemove(item.id);
                setRemoving(false);
              }}
              className="absolute right-0 top-0 h-4 w-4"
            />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ModalCartItems({
  onClose,
}: {
  onClose: () => void;
}): JSX.Element {
  const { state, removeCartItem } = useCart();

  const stateItems = resolveStateCartItems(state);

  if (stateItems) {
    return (
      <div className="grid gap-4">
        {stateItems.map((item) => (
          <div className="border-b pb-4 last:border-b-0" key={item.id}>
            <ModalCartItem
              key={item.id}
              handleRemove={removeCartItem}
              item={item}
              onClose={onClose}
            />
          </div>
        ))}
      </div>
    );
  }

  if (
    state.kind === "uninitialised-cart-state" ||
    state.kind === "loading-cart-state"
  ) {
    return (
      <div className="flex h-full items-center justify-center">
        {/* Turn this spinner into a component with size props */}
        <svg
          aria-hidden="true"
          className="absolute right-0 top-0 h-24 w-24 animate-spin fill-brand-primary text-gray-200 dark:text-gray-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <span>You have no items in your cart!</span>
      <Link href="/" passHref legacyBehavior>
        <button onClick={() => onClose()} className="secondary-btn mt-4">
          Start Shopping
        </button>
      </Link>
    </div>
  );
}

"use client";
import type { CartItem } from "@elasticpath/js-sdk";
import { EditItemQuantityButton } from "./EditQuantityButton";

interface NumberInputProps {
  item: CartItem;
}

export const NumberInput = ({ item }: NumberInputProps): JSX.Element => {
  return (
    <div className="flex items-start rounded-lg border border-black/10">
      <EditItemQuantityButton item={item} type="minus" />
      <svg
        width="2"
        height="36"
        viewBox="0 0 2 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 0V36"
          stroke="black"
          strokeOpacity="0.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="flex w-9 pt-1.5 pb-1 border-none justify-center">
        {item.quantity}
      </span>
      <svg
        width="2"
        height="36"
        viewBox="0 0 2 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 0V36"
          stroke="black"
          strokeOpacity="0.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <EditItemQuantityButton item={item} type="plus" />
    </div>
  );
};

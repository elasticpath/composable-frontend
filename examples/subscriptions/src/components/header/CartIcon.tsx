import Link from "next/link";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

export function CartIcon({ itemCount }: { itemCount: number }) {
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-black"
      aria-label="Go to cart"
    >
      <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2BCC7E] text-xs font-bold text-black">
          {itemCount}
        </span>
      )}
    </Link>
  );
}

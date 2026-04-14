import Link from "next/link";
import EpIcon from "../icons/ep-icon";
import { AccountPopover } from "./account/AccountPopover";
import { CartIcon } from "./CartIcon";
import { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_KEY, CART_COOKIE_KEY } from "@/app/constants";
import { getACart } from "@epcc-sdk/sdks-shopper";
import { initializeShopperClient } from "@/lib/epcc-shopper-client";

const Header = async () => {
  initializeShopperClient();
  const cookieStore = await cookies();
  const authToken = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_KEY)?.value;
  const isAuthenticated = !!authToken;

  const cartId = cookieStore.get(CART_COOKIE_KEY)?.value;
  let cartItemCount = 0;

  if (cartId) {
    try {
      const response = await getACart({
        path: { cartID: cartId },
        query: {
          include: ["items"] as const,
        },
      });

      if (response.data?.included?.items) {
        cartItemCount = response.data.included.items.reduce((sum, item) => {
          if ("quantity" in item) {
            return sum + (item.quantity || 0);
          }
          return sum;
        }, 0);
      }
    } catch (error) {
      console.error("Failed to fetch cart for header:", error);
    }
  }

  return (
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white p-4">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div className="flex min-w-[4rem]">
          <Link href="/" aria-label="Go to home page">
            <EpIcon className="min-w-10 h-10 w-10 relative" />
          </Link>
        </div>
        <div className="flex items-center self-center gap-x-2">
          <AccountPopover isAuthenticated={isAuthenticated} />
          <CartIcon itemCount={cartItemCount} />
        </div>
      </div>
    </div>
  );
};

export default Header;

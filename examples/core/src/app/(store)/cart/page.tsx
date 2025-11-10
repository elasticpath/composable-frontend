import { YourBag } from "./YourBag";
import { CartSidebar } from "./CartSidebar";
import { Button } from "../../../components/button/Button";
import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { getACart } from "@epcc-sdk/sdks-shopper";
import { CART_COOKIE_NAME } from "../../../lib/cookie-constants";
import { cookies } from "next/headers";
import { createElasticPathClient } from "../../../lib/create-elastic-path-client";
import { TAGS } from "../../../lib/constants";

export default async function CartPage() {
  const cartCookie = (await cookies()).get(CART_COOKIE_NAME);
  const client = createElasticPathClient();

  if (!cartCookie) {
    throw new Error("Cart cookie not found");
  }

  const cartResponse = await getACart({
    path: {
      cartID: cartCookie.value,
    },
    query: {
      include: ["items", "promotions", "tax_items", "custom_discounts"],
    },
    client,
    next: {
      tags: [TAGS.cart],
    },
  });

  if (!cartResponse.data) {
    return <div>Cart items not found</div>;
  }

  const items = cartResponse.data.included?.items!;

  return (
    <>
      {items?.length && items.length > 0 ? (
        <div className="flex flex-col lg:flex-row flex-1 self-stretch">
          {/* Main Content */}
          <div className="flex justify-center self-stretch items-start gap-2 flex-only-grow">
            <div className="flex flex-col gap-10 p-5 lg:p-24 w-full">
              <h1 className="text-4xl font-medium">Your Bag</h1>
              {/* Cart Items */}
              <YourBag cart={items} />
            </div>
          </div>
          {/* Sidebar */}
          <div className="flex flex-col items-start gap-5 self-stretch px-5 py-5 lg:px-16 lg:py-40 bg-[#F9F9F9] flex-none">
            <CartSidebar cart={cartResponse.data} />
            <Button type="button" asChild className="self-stretch">
              <Link href="checkout">
                <LockClosedIcon className="w-5 h-5 mr-2" />
                Checkout
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Empty Cart */}
          <div className="mt-12 lg:mt-32 text-center min-h-[30rem]">
            <h3 className="mt-4 text-2xl font-semibold text-gray-900">
              Empty Cart
            </h3>
            <p className="mt-1 text-gray-500">Your cart is empty</p>
            <div className="mt-6">
              <Button variant="primary" asChild>
                <Link href="/">Start shopping</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

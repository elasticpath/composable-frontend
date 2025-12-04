import { YourBag } from "./YourBag";
import { CartSidebar } from "./CartSidebar";
import { Button } from "src/components/button/Button";
import { LocaleLink } from "src/components/LocaleLink";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { getACart, getAllCurrencies, getByContextProduct } from "@epcc-sdk/sdks-shopper";
import { CART_COOKIE_NAME } from "src/lib/cookie-constants";
import { cookies } from "next/headers";
import { createElasticPathClient } from "src/lib/create-elastic-path-client";
import { TAGS } from "src/lib/constants";
import { getPreferredCurrency } from "src/lib/get-locale-currency";

export default async function CartPage({ params }: { params: Promise<{ lang: string }> }) {
  const cartCookie = (await cookies()).get(CART_COOKIE_NAME);
  const client = createElasticPathClient();
  const { lang } = await params;

  if (!cartCookie) {
    throw new Error("Cart cookie not found");
  }

  const currencies = await getAllCurrencies({
    client,
    next: {
      tags: [TAGS.currencies],
    },
  });
  const currency = getPreferredCurrency(lang, currencies.data?.data || []);

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
    headers: {
      "Accept-Language": lang,
      "X-Moltin-Currency": currency?.code,
    }
  });

  const cartCurrency = cartResponse.data?.data?.meta?.display_price?.with_tax?.currency;
  const currencyUpdated = getPreferredCurrency(lang, currencies.data?.data || [], cartCurrency);

  // Fetch product details for each cart item to get original sale price
  const cartItems = cartResponse?.data?.included?.items;
  const productDetailsPromises = cartItems?.map(item =>
    getByContextProduct({
      client,
      path: { product_id: item.product_id! },
      headers: {
        "Accept-Language": lang,
        "X-Moltin-Currency": currencyUpdated?.code,
      }
    })
  );
  const productDetails = await Promise.all(productDetailsPromises || []);

  // Merge product details into cart items
  const cartItemsWithDetails = cartResponse?.data?.included?.items?.map(item => {
    const productDetail = productDetails.find(pd => pd.data?.data?.id === item.product_id)?.data?.data;
    return {
      ...item,
      productDetail,
    };
  });

  if (!cartResponse.data) {
    return <div>Cart items not found</div>;
  }

  const items = cartItemsWithDetails!;

  return (
    <>
      {items?.length && items.length > 0 ? (
        <div className="flex flex-col lg:flex-row flex-1 self-stretch">
          {/* Main Content */}
          <div className="flex justify-center self-stretch items-start gap-2 flex-only-grow">
            <div className="flex flex-col gap-10 p-5 lg:p-24 w-full">
              <h1 className="text-4xl font-medium">Your Bag</h1>
              {/* Cart Items */}
              <YourBag cart={items} currency={currencyUpdated} />
            </div>
          </div>
          {/* Sidebar */}
          <div className="flex flex-col items-start gap-5 self-stretch px-5 py-5 lg:px-16 lg:py-40 bg-[#F9F9F9] flex-none">
            <CartSidebar
              cart={{ ...cartResponse.data, included: { items: cartItemsWithDetails } }}
              storeCurrency={currencyUpdated}
            />
            <Button type="button" asChild className="self-stretch">
              <LocaleLink href="checkout">
                <LockClosedIcon className="w-5 h-5 mr-2" />
                Checkout
              </LocaleLink>
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
                <LocaleLink href="/">Start shopping</LocaleLink>
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

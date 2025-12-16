"use client";
import { GuestInformation } from "./GuestInformation";
import { ShippingForm } from "./ShippingForm";
import { LocaleLink } from "src/components/LocaleLink";
import EpIcon from "src/components/icons/ep-icon";
import { DeliveryForm } from "./DeliveryForm";
import { PaymentForm } from "./PaymentForm";
import { BillingForm } from "./BillingForm";
import { SubmitCheckoutButton } from "./SubmitCheckoutButton";
import { Separator } from "src/components/separator/Separator";
import * as React from "react";
import { CheckoutSidebar } from "./CheckoutSidebar";
import { getACart, ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { GuestCheckoutProvider } from "./checkout-provider";
import { getShippingMethods } from "./useShippingMethod";
import { getPreferredCurrency } from "src/lib/i18n";
import { useParams } from "next/navigation";

export function GuestCheckout({
  cart,
  currencies,
}: {
  cart: Awaited<ReturnType<typeof getACart>>["data"];
  currencies: ResponseCurrency[];
}) {
  const { lang } = useParams();
  const cartCurrencyCode = cart?.data?.meta?.display_price?.with_tax?.currency;
  const storeCurrency = getPreferredCurrency(lang as string, currencies, cartCurrencyCode);
  const shippingMethods = getShippingMethods(cart, storeCurrency);
  
  const hasSubscription =
    cart?.included?.items?.some((item) => {
      return item.type === "subscription_item";
    }) ?? false;

  // dont display shipping/delivery for digital only carts
  const hasPhysical =
    cart?.included?.items?.some((item: any) => {
      return item?.productDetail?.attributes?.commodity_type === "physical";
    }) ?? false;

  return (
    <GuestCheckoutProvider type={hasSubscription ? "subscription" : "guest"} cart={cart} currencies={currencies}>
      <div className="flex flex-col lg:flex-row justify-center">
        <div className="flex justify-center items-center lg:hidden py-5">
          <LocaleLink href="/" aria-label="Go to home page">
            <EpIcon className="h-8 w-auto relative" />
          </LocaleLink>
        </div>
        <div className="flex flex-col lg:flex-row items-start flex-only-grow max-w-[90rem]">
          <form>
            <div className="flex flex-col self-stretch px-5 lg:px-20 lg:w-[37.5rem] flex-1 lg:py-20 items-center gap-10">
              <div className="justify-center items-center hidden lg:flex py-5">
                <LocaleLink href="/" aria-label="Go to home page">
                  <EpIcon className="h-12 w-auto relative" />
                </LocaleLink>
              </div>
              <Separator />
              <div className="flex flex-1 self-stretch">
                <GuestInformation />
              </div>
              <div className="flex flex-1 self-stretch">
                <ShippingForm hasPhysical={hasPhysical} />
              </div>
              {hasPhysical && (
                <DeliveryForm shippingMethods={shippingMethods} />
              )}
              <PaymentForm />
              {hasPhysical && (
                <div className="flex flex-1 self-stretch">
                  <BillingForm />
                </div>
              )}
              <div className="flex flex-1 self-stretch">
                {cart?.data && (
                  <SubmitCheckoutButton
                    cart={cart.data}
                    currencies={currencies ?? []}
                    shippingMethods={shippingMethods}
                    hasPhysical={hasPhysical}
                  />
                )}
              </div>
            </div>
          </form>
          <div className="order-first lg:order-last lg:px-16 w-full lg:w-auto lg:pt-36 lg:bg-[#F9F9F9] lg:h-full lg:shadow-[0_0_0_100vmax_#F9F9F9] lg:clip-path-sidebar">
            {/* Sidebar */}
            {cart?.data && (
              <CheckoutSidebar
                cart={cart}
                currencies={currencies ?? []}
                hasPhysical={hasPhysical}
              />
            )}
          </div>
        </div>
      </div>
    </GuestCheckoutProvider>
  );
}

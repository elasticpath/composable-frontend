import Link from "next/link";
import EpIcon from "../../../components/icons/ep-icon";
import { Separator } from "../../../components/separator/Separator";
import { DeliveryForm } from "./DeliveryForm";
import { PaymentForm } from "./PaymentForm";
import { BillingForm } from "./BillingForm";
import { SubmitCheckoutButton } from "./SubmitCheckoutButton";
import { CheckoutSidebar } from "./CheckoutSidebar";
import { AccountCheckoutProvider } from "./checkout-provider";
import * as React from "react";
import {
  AccountAddressResponse,
  AccountMemberResponse,
  getCart,
  ResponseCurrency,
} from "@epcc-sdk/sdks-shopper";
import { AccountDisplay } from "./AccountDisplay";
import { ShippingSelector } from "./ShippingSelector";

export function AccountCheckoutForm({
  account,
  addresses,
  currencies,
  cart,
}: {
  cart: NonNullable<Awaited<ReturnType<typeof getCart>>["data"]>;
  account: AccountMemberResponse;
  addresses: Array<AccountAddressResponse>;
  currencies: ResponseCurrency[];
}) {
  return (
    <AccountCheckoutProvider>
      <div className="flex flex-col lg:flex-row justify-center">
        <div className="flex justify-center items-center lg:hidden py-5">
          <Link href="/" aria-label="Go to home page">
            <EpIcon className="h-8 w-auto relative" />
          </Link>
        </div>
        <div className="flex flex-col lg:flex-row items-start flex-only-grow max-w-[90rem]">
          <div className="flex flex-col px-5 lg:px-20 lg:w-[37.5rem] flex-1 lg:py-20 gap-10">
            <div className="justify-center items-center hidden lg:flex py-5">
              <Link href="/" aria-label="Go to home page">
                <EpIcon className="h-12 w-auto relative" />
              </Link>
            </div>
            <Separator />
            <div className="flex flex-col flex-1 gap-5">
              <span className="text-2xl font-medium">Your Info</span>
              {account && <AccountDisplay accountMember={account} />}
            </div>
            <div className="flex flex-col flex-1 gap-5">
              <span className="text-2xl font-medium">Shipping address</span>
              <ShippingSelector accountAddresses={addresses} />
            </div>
            <DeliveryForm />
            <PaymentForm />
            <div className="flex flex-1">
              <BillingForm />
            </div>
            <div className="flex flex-1">
              {cart.data && <SubmitCheckoutButton cart={cart.data} />}
            </div>
          </div>
          <div className="order-first lg:order-last lg:px-16 w-full lg:w-auto lg:pt-36 lg:bg-[#F9F9F9] lg:h-full lg:shadow-[0_0_0_100vmax_#F9F9F9] lg:clip-path-sidebar">
            {/* Sidebar */}
            <CheckoutSidebar cart={cart} currencies={currencies ?? []} />
          </div>
        </div>
      </div>
    </AccountCheckoutProvider>
  );
}

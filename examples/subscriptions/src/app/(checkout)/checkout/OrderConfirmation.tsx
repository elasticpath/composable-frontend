"use client";

import { useCheckout } from "./checkout-provider";
import { ConfirmationSidebar } from "./ConfirmationSidebar";
import Link from "next/link";
import EpIcon from "../../../components/icons/ep-icon";
import * as React from "react";
import { Separator } from "../../../components/separator/Separator";
import { CheckoutFooter } from "./CheckoutFooter";
import { Button } from "../../../components/button/Button";

export function OrderConfirmation() {
  const { confirmationData } = useCheckout();

  if (!confirmationData) {
    return null;
  }

  const { order } = confirmationData;

  const customerName = (
    order.data.contact?.name ??
    order.data.customer.name ??
    ""
  ).split(" ")[0];

  const { shipping_address, id: orderId } = order.data;

  return (
    <div className="lg:flex lg:min-h-full">
      <div className="flex justify-center items-center lg:hidden py-5">
        <Link href="/" aria-label="Go to home page">
          <EpIcon className="h-8 w-auto relative" />
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row items-start flex-only-grow">
        {/* Confirmation Content */}
        <div className="flex flex-col self-stretch px-5 lg:px-20 lg:w-[37.5rem] flex-1 lg:py-20 gap-10">
          <div className="justify-center items-center hidden lg:flex py-5">
            <Link href="/" aria-label="Go to home page">
              <EpIcon className="h-12 w-auto relative" />
            </Link>
          </div>
          <Separator />
          <span className="text-4xl font-medium">
            Thanks{customerName ? ` ${customerName}` : ""}!
          </span>
          <div>
            <Button variant="secondary" size="small" asChild>
              <Link href="/">Continue shopping</Link>
            </Button>
          </div>
          <span className="text-black/60">
            Order <span className="text-black">#{orderId}</span> is confirmed.
          </span>
          {/* Shipping */}
          <section className="flex flex-col gap-5 ">
            <h2 className="text-2xl font-medium">Ship to</h2>
            <div>
              <span className="text-base font-medium">{`${shipping_address.first_name} ${shipping_address.last_name}`}</span>
              <p className="text-sm text-black/60">{shipping_address.line_1}</p>
              <span className="text-sm text-black/60">{`${shipping_address.region}, ${shipping_address.postcode}`}</span>
              {shipping_address.phone_number && (
                <span>{shipping_address.phone_number}</span>
              )}
            </div>
          </section>
          {/* Delivery Method */}
          <section>
            <h2 className="text-2xl font-medium">Delivery Method</h2>
            <p className="text-black/60">placeholder</p>
          </section>
          {/* Contact us */}
          <section>
            <h2 className="text-2xl font-medium">Need to make changes?</h2>
            <p className="text-black/60">
              Email us or call. Remember to reference order #{orderId}
            </p>
          </section>
          <CheckoutFooter />
        </div>
        {/* Confirmation Sidebar */}
        <div className="order-first lg:order-last lg:px-16 lg:pt-36  w-full lg:w-auto lg:bg-[#F9F9F9] lg:h-full">
          <div className="lg:flex lg:flex-col lg:gap-5 w-full lg:w-auto lg:max-w-[24.375rem]">
            <span className="hidden lg:inline-block text-2xl font-medium truncate">{`Order #${orderId}`}</span>
            <Separator />
            <ConfirmationSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

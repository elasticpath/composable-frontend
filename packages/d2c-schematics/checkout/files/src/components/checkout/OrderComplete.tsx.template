import Link from "next/link";
import { OrderCompleteState } from "./types/order-pending-state";
import Image from "next/image";
import NextLink from "next/link";
import { PresentCartState } from "@elasticpath/react-shopper-hooks";
import * as React from "react";

interface IOrderComplete {
  state: OrderCompleteState;
}

export default function OrderComplete({
  state: {
    paymentResponse,
    cart,
    checkoutForm: {
      shippingAddress,
      billingAddress,
      personal: { email },
    },
  },
}: IOrderComplete): JSX.Element {
  return (
    <div className="grid gap-1">
      <h3 className="text-lg font-medium">Thank you for your order!</h3>
      <h2 className="text-xl sm:text-3xl font-bold">Order Complete</h2>
      <span className="break-all text-sm sm:text-base">
        Your order number: #{paymentResponse.data.id}
      </span>
      <hr className="my-8" />
      <div className="grid gap-8">
        {cart.items.map((item) => {
          return (
            <div
              className="grid grid-col-1 sm:grid-cols-[auto_1fr] gap-4 border-b pb-8 last:border-b-0"
              key={item.id}
            >
              <div className="cursor-pointer relative aspect-square bg-[#f6f7f9] w-[5rem] rounded-lg sm:w-[8rem] lg:w-[10rem]">
                <Link href={`/products/${item.product_id}`} legacyBehavior>
                  <Image
                    src={item.image.href}
                    alt={item.name}
                    className="rounded-lg"
                    sizes="(max-width: 150px)"
                    fill
                    style={{
                      objectFit: "contain",
                      objectPosition: "center",
                    }}
                  />
                </Link>
              </div>
              <div className="grid grid-rows-[auto_1fr_auto] gap-1">
                <span className="font-semibold">{item.name}</span>
                <span className="line-clamp-5 text-sm font-light">
                  {item.description}
                </span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium">{`Quantity ${item.quantity}`}</span>
                  <div className="inline-block h-4 border-l"></div>
                  <span className="font-medium">
                    {`Price ${item.meta.display_price.with_tax.value.formatted}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <hr className="my-8" />
      <div className="grid grid-cols-[1fr] gap-x-4 gap-y-8 text-sm sm:grid-cols-[1fr_1fr_1fr]">
        <AddressBlock label="Shipping Address" {...shippingAddress} />
        <AddressBlock
          label="Billing Address"
          {...(billingAddress ?? shippingAddress)}
        />
        <div>
          <span className="pb-2 font-medium">Contact Information</span>
          <span>{email}</span>
        </div>
      </div>
      <hr className="my-8" />
      <CompleteOrderSummary cart={cart} />
      <div className="mt-8 flex justify-end">
        <NextLink href="/" passHref legacyBehavior>
          <button className="primary-btn w-fit">Continue Shopping</button>
        </NextLink>
      </div>
    </div>
  );
}

interface IAddressBlock {
  label: string;
  first_name: string;
  last_name: string;
  line_1: string;
  line_2?: string;
  postcode: string;
  region: string;
}

function AddressBlock({
  label,
  first_name,
  last_name,
  region,
  line_1,
  line_2,
  postcode,
}: IAddressBlock): JSX.Element {
  return (
    <div className="flex flex-col">
      <span className="pb-2 font-medium">{label}</span>
      <span>{`${first_name} ${last_name}`}</span>
      <span>{line_1}</span>
      <span>{line_2}</span>
      <span>{postcode}</span>
      <span>{region}</span>
    </div>
  );
}

interface ICompleteOrderSummary {
  cart: PresentCartState;
}

function CompleteOrderSummary({
  cart: {
    withTax,
    withoutTax,
    groupedItems: { promotion },
  },
}: ICompleteOrderSummary): JSX.Element {
  return (
    <table className="mt-4 table-fixed">
      <tbody>
        <tr className="h-14 border-b text-sm">
          <td className="w-full pl-0 text-gray-600">Subtotal</td>
          <td className="text-right">{withoutTax}</td>
        </tr>
        <tr className="h-14 border-b text-sm">
          <td className="w-full pl-0 text-gray-600">
            <div className="flex items-start">
              <span>Discount</span>
              {promotion.length > 0 && (
                <span className="text-red-600" color="red.600">
                  ( {promotion[0].sku} )
                </span>
              )}
            </div>
          </td>
          <td className="text-right text-sm">
            {promotion && promotion.length > 0 ? (
              <div className="flex items-end">
                <span>
                  {promotion[0].meta.display_price.without_tax.unit.formatted}
                </span>
                <button className="mt-0 p-0">Remove</button>
              </div>
            ) : (
              "$0.00"
            )}
          </td>
        </tr>
        <tr className="h-14 font-medium">
          <td className="lg:text-md pl-0 text-sm">Order Total</td>
          <td>{withTax}</td>
        </tr>
      </tbody>
    </table>
  );
}

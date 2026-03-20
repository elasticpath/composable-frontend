"use client";

import React, { useState, useTransition } from "react";
import { getACartQueryKey } from "@epcc-sdk/sdks-shopper/react-query";
import { getCookie } from "cookies-next";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../../components/button/Button";
import { addToCart } from "../add-to-cart-action";
import { useNotify } from "../../../../hooks/use-event";
import { CART_COOKIE_NAME } from "../../../../lib/cookie-constants";
import { client } from "../../../../lib/client";

interface PricingOption {
  id?: string;
  attributes?: {
    name?: string;
    billing_interval_type?: string;
    billing_frequency?: number;
  };
  meta?: {
    prices?: Record<
      string,
      {
        display_price?: {
          without_tax?: { formatted?: string };
        };
      }
    >;
  };
}

interface Plan {
  id?: string;
  attributes?: {
    name?: string;
    description?: string;
  };
}

interface Props {
  offeringId: string;
  plan: Plan;
  pricingOptions: PricingOption[];
}

const cartErrorOptions = {
  scope: "cart",
  type: "error",
  action: "add-product",
} as const;

export default function PricingOptions({
  offeringId,
  plan,
  pricingOptions,
}: Props) {
  const [selectedPricingOption, setSelectedPricingOption] = useState<
    string | null
  >(null);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const handleAddToCart = () => {
    if (!selectedPricingOption) return;

    startTransition(async () => {
      try {
        const result = await addToCart({
          offeringId,
          planId: plan.id!,
          pricingOptionId: selectedPricingOption,
        });

        if (result.error) {
          notify({
            ...cartErrorOptions,
            message: (result.error as any).errors[0]?.detail,
            cause: {
              type: "cart-store-error",
              cause: new Error(JSON.stringify(result.error)),
            },
          });
        } else {
          notify({
            scope: "cart",
            type: "success",
            action: "add-product",
            message: "Successfully added to cart",
          });
        }
      } catch (err) {
        notify({
          ...cartErrorOptions,
          message: "Failed to add to cart",
          cause: {
            type: "cart-store-error",
            cause: err as Error,
          },
        });
      } finally {
        const cartID = await getCookie(CART_COOKIE_NAME);
        const queryKey = getACartQueryKey({
          client,
          path: { cartID: cartID! },
          query: { include: ["items"] },
        });
        await queryClient.invalidateQueries({ queryKey });
      }
    });
  };

  const getPriceForOption = (option: PricingOption) =>
    option.meta?.prices?.[plan.id!]?.display_price?.without_tax?.formatted;

  const formatInterval = (option: PricingOption) => {
    const freq = option.attributes?.billing_frequency;
    const type = option.attributes?.billing_interval_type;
    if (!freq || !type) return "";
    return freq === 1 ? `per ${type}` : `every ${freq} ${type}s`;
  };

  return (
    <div className="p-4">
      <div className="w-full mx-auto py-6 px-[6rem]">
        <h2 className="text-4xl font-semibold text-center mb-4">
          {plan.attributes?.name}
        </h2>
        {plan.attributes?.description && (
          <p className="text-xl text-center text-[#62687A] mb-4">
            {plan.attributes.description}
          </p>
        )}
        <p className="text-xl font-semibold text-center mb-6">
          Choose a pricing option
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          {pricingOptions.map((option) => {
            const isSelected = selectedPricingOption === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedPricingOption(option.id!)}
                className={`border rounded-lg p-6 text-left transition-colors ${
                  isSelected
                    ? "border-black bg-black/5"
                    : "border-[#DEE4F3] hover:border-black/40"
                }`}
              >
                <div className="text-lg font-semibold">
                  {option.attributes?.name}
                </div>
                <div className="text-sm text-[#62687A] mt-1">
                  {formatInterval(option)}
                </div>
                <div className="text-xl font-medium mt-2">
                  {getPriceForOption(option) ?? "N/A"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button
            disabled={!selectedPricingOption || isPending}
            onClick={handleAddToCart}
          >
            {isPending ? "Adding..." : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}

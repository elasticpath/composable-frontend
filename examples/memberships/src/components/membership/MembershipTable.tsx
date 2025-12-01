"use client";
import React, { useState, useTransition } from "react";
import CheckIcon from "../icons/check-icon";
import CrossIcon from "../icons/cross-icon";
import MinusIcon from "../icons/minus-icon";
import PlusIcon from "../icons/plus-icon";
import { GetOfferingResponse } from "@epcc-sdk/sdks-shopper";
import { getACartQueryKey } from "@epcc-sdk/sdks-shopper/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select/Select";
import { addToCart } from "../../app/(store)/membership/add-to-cart-action";
import { getCookie } from "cookies-next";
import { CART_COOKIE_NAME } from "../../lib/cookie-constants";
import { client } from "../../lib/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNotify } from "../../hooks/use-event";
import { Button } from "../button/Button";

interface IMembershipTableProps {
  offering: GetOfferingResponse;
}

const cartErrorOptions = {
  scope: "cart",
  type: "error",
  action: "add-product",
} as const;

const MembershipTable: React.FC<IMembershipTableProps> = ({ offering }) => {
  const combinedProducts =
    (offering.included as { products?: Array<{ id?: string; attributes?: { name?: string; feature_configurations?: Record<string, unknown> }; meta?: { display_price?: { without_tax?: { formatted?: string } } } }> })?.products ?? [];
  const pricingOptions = offering.included?.plans ?? [];

  const [selectedPricingOption, setSelectedPricingOption] = useState<string>(
    pricingOptions[0]?.id ?? "",
  );

  const features = offering.included?.features;
  const tagToIdsMap = new Map<string, Set<string>>();
  offering.included?.features?.forEach((feature) => {
    if (feature.attributes?.configuration.type === "access") {
      if (!tagToIdsMap.has(feature.attributes.configuration.tag)) {
        tagToIdsMap.set(feature.attributes?.configuration.tag, new Set());
      }
      tagToIdsMap.get(feature.attributes?.configuration.tag)?.add(feature.id!);
    }
  });

  const [expandedFeatures, setExpandedFeatures] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const toggleFeature = (index: number) => {
    setExpandedFeatures((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  console.log("selectedPricingOption: ", selectedPricingOption);

  const handleClick = ({
    planId,
    offeringId,
  }: {
    planId: string;
    offeringId: string;
  }) => {
    startTransition(async () => {
      try {
        const result = await addToCart({ offeringId, planId });

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
            message: "Successfully added product to cart",
          });
        }
      } catch (err) {
        notify({
          ...cartErrorOptions,
          message: "Failed to add product to cart",
          cause: {
            type: "cart-store-error",
            cause: err as Error,
          },
        });
      } finally {
        const cartID = await getCookie(CART_COOKIE_NAME);
        const queryKey = getACartQueryKey({
          client,
          path: {
            cartID: cartID!,
          },
          query: {
            include: ["items"],
          },
        });

        await queryClient.invalidateQueries({ queryKey });
      }
    });
  };

  return (
    <div className="overflow-x-auto p-4">
      <div className="w-full mx-auto py-6 px-[6rem]">
        <h2 className="text-4xl font-semibold text-center mb-4">Membership</h2>
        <p className="text-xl font-semibold text-center mb-6">
          Choose a membership plan that’s best for you
        </p>

        <Select
          onValueChange={setSelectedPricingOption}
          defaultValue={pricingOptions[0]?.id}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a pricing option" />
          </SelectTrigger>
          <SelectContent>
            {pricingOptions?.map((plan, index) => {
              return (
                <SelectItem value={plan.id!} key={plan.id!}>
                  {plan.attributes?.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="">
                <th className="p-4 text-left"></th>
                {combinedProducts.map((product: typeof combinedProducts[number], index: number) => (
                  <th key={index} className="p-4 text-center">
                    <>
                      <div className="text-lg font-semibold">
                        {product?.attributes?.name}
                      </div>
                      <div className="text-sm font-normal text-[#62687A]">
                        Standard, 12-month
                      </div>
                      <div className="text-base font-medium">
                        {product?.meta?.display_price?.without_tax?.formatted}
                      </div>
                    </>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features?.map((feature, index: number) => (
                <tr
                  key={index}
                  className={
                    index === features.length - 1
                      ? ""
                      : "border-b border-[#DEE4F3]"
                  }
                >
                  <td
                    className={`text-sm font-medium py-2 px-2 w-[28.75] ${
                      index === features.length - 1
                        ? ""
                        : "border-b border-[#DEE4F3]"
                    }`}
                  >
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => toggleFeature(index)}
                    >
                      <span className="mr-1">
                        {expandedFeatures.includes(index) ? (
                          <MinusIcon />
                        ) : (
                          <PlusIcon />
                        )}
                      </span>
                      <span>
                        {feature.attributes?.name || "Unnamed Feature"}
                      </span>
                    </div>
                    {expandedFeatures.includes(index) && (
                      <div className="text-xs font-normal text-[#62687A] mt-2 ml-6">
                        {feature.attributes?.description || "No description"}
                      </div>
                    )}
                  </td>
                  {combinedProducts.map((product: typeof combinedProducts[number], productIndex: number) => (
                    <td key={productIndex} className="py-2 px-2 text-center">
                      <div className="flex justify-center items-center">
                        {feature.attributes.configuration.type === "access" &&
                        Array.from(
                          tagToIdsMap.get(
                            feature.attributes.configuration.tag,
                          ) || [],
                        ).some((featureId) =>
                          product?.attributes?.feature_configurations?.hasOwnProperty(
                            featureId,
                          ),
                        ) ? (
                          <CheckIcon />
                        ) : (
                          <CrossIcon />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4"></td>
                {combinedProducts.map((product, productIndex: number) => {
                  const offeringId = offering?.data?.id;
                  return (
                    <td key={productIndex} className="p-4 text-center">
                      <Button
                        disabled={isPending}
                        onClick={() =>
                          handleClick({
                            planId: selectedPricingOption!,
                            offeringId: offeringId!,
                          })
                        }
                        size="small"
                      >
                        Select plan
                      </Button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembershipTable;

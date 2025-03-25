"use client";
import React, { useState } from "react";
import CheckIcon from "../icons/check-icon";
import CrossIcon from "../icons/cross-icon";
import MinusIcon from "../icons/minus-icon";
import PlusIcon from "../icons/plus-icon";
import Link from "next/link";
import { GetOfferingResponse } from "@epcc-sdk/sdks-shopper";

interface IMembershipTableProps {
  standardOffering: GetOfferingResponse;
  proOffering: GetOfferingResponse;
  bundleOffering: GetOfferingResponse;
}

const MembershipTable: React.FC<IMembershipTableProps> = ({
  standardOffering,
  proOffering,
  bundleOffering,
}) => {
  const combinedOfferings = [standardOffering, proOffering, bundleOffering];

  const combinedProducts = combinedOfferings.flatMap(
    (offering) => offering.included?.products,
  );

  const features = standardOffering.included?.features;
  const tagToIdsMap = new Map<string, Set<string>>();
  combinedOfferings.forEach((offering) => {
    offering.included?.features?.forEach((feature) => {
      if (feature.attributes?.configuration.type === "access") {
        if (!tagToIdsMap.has(feature.attributes.configuration.tag)) {
          tagToIdsMap.set(feature.attributes?.configuration.tag, new Set());
        }
        tagToIdsMap
          .get(feature.attributes?.configuration.tag)
          ?.add(feature.id!);
      }
    });
  });

  const [expandedFeatures, setExpandedFeatures] = useState<number[]>([]);
  const toggleFeature = (index: number) => {
    setExpandedFeatures((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div className="overflow-x-auto p-4">
      <div className="w-full mx-auto py-6 px-[6rem]">
        <h2 className="text-4xl font-semibold text-center mb-4">
          ATD Membership
        </h2>
        <p className="text-xl font-semibold text-center mb-6">
          Choose a membership plan that’s best for you
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="">
                <th className="p-4 text-left"></th>
                {combinedProducts.map((product, index: number) => (
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
                  {combinedProducts.map((product, productIndex: number) => (
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
                  const offering = combinedOfferings.find((offering) =>
                    offering.included?.products?.some(
                      (prod) => prod.id === product?.id,
                    ),
                  );
                  const offeringId = offering?.data?.id;

                  const pagePaths: { [key: string]: string } = {
                    "efb581fd-555e-4973-bacf-fbc3036f68be": "standard",
                    "82123918-3ab8-4826-a975-58f07ebd6908": "pro",
                    "3e88d790-f86a-45d5-8ad6-80ab78169940": "bundle",
                  };
                  const pagePath = (offeringId && pagePaths[offeringId]) || "";

                  return (
                    <td key={productIndex} className="p-4 text-center">
                      <Link
                        // href={`/membership/pricing-options/${offeringId}`}
                        href={`/membership/${pagePath}`}
                        className="text-sm font-medium bg-black text-white px-4 py-2 mb-2 rounded-md inline-block"
                      >
                        Select plan
                      </Link>
                      {/* <div className="text-xs font-normal px-10 text-[#1F8552]">
                        Pricing summary
                      </div> */}
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

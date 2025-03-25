import Link from "next/link";
import Price from "../product/Price";
import StrikePrice from "../product/StrikePrice";
import { EP_CURRENCY_CODE } from "../../lib/resolve-ep-currency-code";
import Image from "next/image";
import { EyeSlashIcon } from "@heroicons/react/24/solid";

import type { JSX } from "react";
import { Product } from "@epcc-sdk/sdks-shopper";
import { getMainImageForProductResponse } from "../../lib/file-lookup";
import { ElasticPathFile } from "@epcc-sdk/sdks-shopper/dist/client/types.gen";

export default function HitComponent({
  hit,
  mainImages,
}: {
  hit: Product;
  mainImages?: ElasticPathFile[];
}): JSX.Element {
  const main_image = getMainImageForProductResponse(hit, mainImages ?? []);

  const ep_main_image_url = main_image?.link?.href;

  // const currencyPrice = ep_price?.[EP_CURRENCY_CODE];
  const currencyPrice = hit.meta?.display_price?.without_tax?.formatted;

  return (
    <>
      <Link href={`/products/${hit.id}`} legacyBehavior>
        <div
          className="group flex h-full cursor-pointer flex-col items-stretch"
          data-testid={hit.id}
        >
          <div className="relative bg-[#f6f7f9] overflow-hidden rounded-t-lg border-gray-200 border-l border-r border-t pb-[100%]">
            {ep_main_image_url ? (
              <Image
                className="relative h-full w-full transition duration-300 ease-in-out group-hover:scale-105"
                src={ep_main_image_url}
                alt={hit.attributes?.name!}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{
                  objectFit: "contain",
                  objectPosition: "center",
                }}
              />
            ) : (
              <div className="absolute flex h-full w-full items-center justify-center bg-gray-200">
                <EyeSlashIcon width={10} height={10} />
              </div>
            )}
          </div>
          <div className="flex h-full flex-col gap-2 rounded-b-lg border-gray-200 border-b border-l border-r p-4">
            <div className="h-full">
              <Link href={`/products/${hit.id}`} passHref legacyBehavior>
                <h3 className="text-sm font-bold">{hit.attributes?.name}</h3>
              </Link>
              <span className="mt-2 line-clamp-6 text-xs font-medium leading-5 text-gray-500">
                {hit.attributes?.description}
              </span>
            </div>
            <div>
              {currencyPrice && (
                <div className="mt-1 flex items-center">
                  <Price
                    price={hit.meta?.display_price?.without_tax?.formatted!}
                    currency={EP_CURRENCY_CODE}
                  />
                  {hit.meta?.original_display_price?.without_tax?.formatted && (
                    <StrikePrice
                      price={
                        hit.meta?.original_display_price?.without_tax?.formatted
                      }
                      currency={EP_CURRENCY_CODE}
                      size="text-lg"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}

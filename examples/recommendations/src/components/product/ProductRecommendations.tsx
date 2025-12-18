"use client";

import { IncludedResponse, Product } from "@epcc-sdk/sdks-shopper";
import { getMainImageForProductResponse } from "src/lib/file-lookup";
import { EyeSlashIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

interface ProductRecommendationsProps {
  similarProducts: Product[];
  included?: IncludedResponse;
}

export function ProductRecommendations({ similarProducts, included }: ProductRecommendationsProps) {

  return (
    <div className="mt-20 flex flex-col">
      <div className="text-xl font-medium">Similar Products:</div>
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
      >
        {similarProducts.map((product) => {
          const productSlug = product?.attributes?.slug;
          // const canonicalURL = getProductURLSegment({ id: product.id, attributes: { slug: productSlug } });
          const main_image = getMainImageForProductResponse(product, included?.main_images ?? []);
          const ep_main_image_url = main_image?.link?.href;
          return (
            <Link key={product.id} href={product?.id || ''}>
              <li className="relative group">
                <div className=" aspect-square block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                  <div className="relative w-full h-full bg-[#f6f7f9] rounded-lg text-center animate-fadeIn  transition duration-300 ease-in-out group-hover:scale-105">
                    {ep_main_image_url ? (
                      <Image
                        alt={main_image?.file_name!}
                        src={ep_main_image_url}
                        className="rounded-lg"
                        sizes="(max-width: 200px)"
                        fill
                        style={{
                          objectFit: "contain",
                          objectPosition: "center",
                        }}
                      />
                    ) : (
                      <div className="w-[64px] h-[64px] flex items-center justify-center text-white bg-gray-200 rounded-md shadow-xs object-cover">
                        <EyeSlashIcon className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                  {product.attributes?.name}
                </p>
                <p className="pointer-events-none block text-sm font-medium text-gray-500">
                  {product.meta?.display_price?.without_tax?.formatted}
                </p>
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
}

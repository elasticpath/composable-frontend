"use server";
import { ArrowRightIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { getServerSideImplicitClient } from "../../lib/epcc-server-side-implicit-client";
import { getProductDisplayPrices, getProductURLSegment } from "../../lib/product-helper";
import PriceDisplay, { SalePriceDisplayStyle } from "../product/PriceDisplay";
import { fetchFeaturedProducts } from "./fetchFeaturedProducts";
import { FormattedPrice } from "@elasticpath/js-sdk";

interface IFeaturedProductsProps {
  title: string;
  linkProps?: {
    link: string;
    text: string;
  };
}

export default async function FeaturedProducts({
  title,
  linkProps,
}: IFeaturedProductsProps) {
  const client = getServerSideImplicitClient();
  const products = await fetchFeaturedProducts(client);
  const productPriceMap = new Map<
    string,
    {
      displayPrice: FormattedPrice | unknown;
      originalPrice: FormattedPrice | unknown;
    }
  >();
  for (const product of products) {
    productPriceMap.set(product.id, getProductDisplayPrices(product));
  };

  return (
    <div
      className={clsx(
        products.length ? "block" : "hidden",
        "max-w-7xl my-0 mx-auto",
      )}
    >
      <div className="flex justify-between flex-wrap gap-2 mb-4">
        <h2 className="text-base md:text-[1.1rem] lg:text-[1.3rem] font-extrabold">
          {title}
        </h2>
        {linkProps && (
          <Link
            className="text-sm md:text-md lg:text-lg font-bold hover:cursor-pointer"
            href={linkProps.link}
          >
            <span className="flex items-center gap-2 font-bold hover:text-brand-primary hover:cursor-pointer">
              {linkProps.text} <ArrowRightIcon className="h-4 w-4" />
            </span>
          </Link>
        )}
      </div>
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
      >
        {products.map((product) => (
          <Link key={product.id} href={getProductURLSegment(product)}>
            <li className="relative group">
              <div className=" aspect-square block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                <div className="relative w-full h-full bg-[#f6f7f9] rounded-lg text-center animate-fadeIn  transition duration-300 ease-in-out group-hover:scale-105">
                  {product.main_image?.link.href ? (
                    <Image
                      alt={product.main_image?.file_name!}
                      src={product.main_image?.link.href}
                      className="rounded-lg"
                      sizes="(max-width: 200px)"
                      fill
                      style={{
                        objectFit: "contain",
                        objectPosition: "center",
                      }}
                    />
                  ) : (
                    <div className="w-[64px] h-[64px] flex items-center justify-center text-white bg-gray-200 rounded-md shadow-sm object-cover">
                      <EyeSlashIcon className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
              <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                {product.attributes.name}
              </p>
              <PriceDisplay
                display_price={productPriceMap.get(product.id)?.displayPrice}
                original_display_price={
                  productPriceMap.get(product.id)?.originalPrice
                }
                showCurrency={false}
                salePriceDisplay={
                  SalePriceDisplayStyle.strikePriceWithCalcValue
                }
                priceDisplayStyleOverride="text-base text-gray-500"
                saleCalcDisplayStyleOverride="pr-4 text-sm font-light text-red-500 content-center"
              />
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}

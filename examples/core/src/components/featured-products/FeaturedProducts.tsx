"use server";
import clsx from "clsx";
import { LocaleLink } from "../LocaleLink";
import { ArrowRightIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { fetchFeaturedProducts } from "./fetchFeaturedProducts";
import { createElasticPathClient } from "../../lib/create-elastic-path-client";

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
  const client = createElasticPathClient();
  const products = await fetchFeaturedProducts(client);

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
          <LocaleLink
            className="text-sm md:text-md lg:text-lg font-bold hover:cursor-pointer"
            href={linkProps.link}
          >
            <span className="flex items-center gap-2 font-bold hover:text-brand-primary hover:cursor-pointer">
              {linkProps.text} <ArrowRightIcon className="h-4 w-4" />
            </span>
          </LocaleLink>
        )}
      </div>
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
      >
        {products.map((product) => (
          <LocaleLink key={product.id} href={`/products/${product.id}`}>
            <li className="relative group">
              <div className=" aspect-square block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                <div className="relative w-full h-full bg-[#f6f7f9] rounded-lg text-center animate-fadeIn  transition duration-300 ease-in-out group-hover:scale-105">
                  {product.main_image?.link?.href ? (
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
          </LocaleLink>
        ))}
      </ul>
    </div>
  );
}

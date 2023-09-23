import React, { useCallback, useEffect, useState } from "react";
import type { ProductResponseWithImage } from "../../lib/types/product-types";
import { connectProductsWithMainImages } from "../../lib/product-util";
import { getProducts } from "../../services/products";
import clsx from "clsx";
import Link from "next/link";
import { ArrowRightIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface IFeaturedProductsBaseProps {
  title: string;
  linkProps?: {
    link: string;
    text: string;
  };
}

interface IFeaturedProductsProvidedProps extends IFeaturedProductsBaseProps {
  type: "provided";
  products: ProductResponseWithImage[];
}

interface IFeaturedProductsFetchProps extends IFeaturedProductsBaseProps {
  type: "fetch";
}

type IFeaturedProductsProps =
  | IFeaturedProductsFetchProps
  | IFeaturedProductsProvidedProps;

const FeaturedProducts = (props: IFeaturedProductsProps): JSX.Element => {
  const { type, title, linkProps } = props;

  const [products, setProducts] = useState<ProductResponseWithImage[]>(
    type === "provided" ? props.products : [],
  );

  const fetchNodeProducts = useCallback(async () => {
    if (type === "fetch") {
      const { data, included } = await getProducts();
      let products = data.slice(0, 4);
      if (included?.main_images) {
        products = connectProductsWithMainImages(
          products,
          included.main_images,
        );
      }
      setProducts(products);
    }
  }, [type]);

  useEffect(() => {
    try {
      fetchNodeProducts();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [fetchNodeProducts]);

  return (
    <div
      className={clsx(
        products.length ? "block" : "hidden",
        "max-w-7xl my-0 mx-auto",
      )}
    >
      <div className="flex justify-between flex-wrap gap-2">
        <h2 className="text-base md:text-[1.1rem] lg:text-[1.3rem] font-extrabold">
          {title}
        </h2>
        {linkProps && (
          <Link
            className="text-sm md:text-md lg:text-lg font-bold text-brand-primary hover:cursor-pointer"
            href={linkProps.link}
          >
            <span className="flex items-center gap-2 font-bold hover:text-brand-primary hover:cursor-pointer">
              {linkProps.text} <ArrowRightIcon className="h-4 w-4" />
            </span>
          </Link>
        )}
      </div>
      <div className="flex justify-between items-center mt-4 mb-8 flex-wrap hover:cursor-pointer">
        {products.map((product) => (
          <Link
            className="flex items-center justify-center flex-col p-4 basis-full md:basis-1/2 lg:basis-1/4"
            key={product.id}
            href={`/products/${product.id}`}
          >
            <div className="w-full max-w-[200px] text-center">
              {product.main_image?.link.href ? (
                <Image
                  className="rounded-md shadow-sm"
                  width={200}
                  height={200}
                  alt={product.main_image?.file_name || "Empty"}
                  src={product.main_image?.link.href}
                  objectFit="cover"
                  quality={100}
                />
              ) : (
                <div className="w-[64px] h-[64px] flex items-center justify-center text-white bg-gray-200 rounded-md shadow-sm object-cover">
                  <EyeSlashIcon className="w-3 h-3" />
                </div>
              )}

              <h2 className="text-sm p-0.5 font-semibold">
                {product.attributes.name}
              </h2>
              <h3 className="text-sm">
                {product.meta.display_price?.without_tax.formatted}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;

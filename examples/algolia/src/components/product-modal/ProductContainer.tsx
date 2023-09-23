import ProductSummary from "./ProductSummary";
import CartActions from "../product/CartActions";
import { IBase } from "../../lib/types/product-types";
import { ReactElement } from "react";
import ProductDetails from "../product/ProductDetails";
import { EyeSlashIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

interface IProductContainer {
  productBase: IBase;
  children?: ReactElement;
}

export default function ProductContainer({
  productBase: { product, main_image },
  children,
}: IProductContainer): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-8 py-8 md:grid-cols-2 md:gap-10">
      {main_image ? (
        <Image
          className="max-w-[28rem] overflow-hidden rounded-lg object-cover object-center md:max-w-[36rem]"
          src={main_image.link.href}
          alt={product.attributes.name}
          width={800}
          height={800}
        />
      ) : (
        <div className="flex h-full max-h-[28rem] min-h-[28rem] w-full overflow-hidden rounded-lg bg-gray-200 text-white md:max-w-[36rem]">
          <EyeSlashIcon width={10} height={10} />
        </div>
      )}
      <div className="flex flex-col gap-6">
        <ProductSummary product={product} />
        <ProductDetails product={product} />
        {children}
        <div>
          <CartActions productId={product.id} />
          <Link
            href={`/products/${product.id}`}
            className="m-[0.625] block p-4 font-semibold hover:text-brand-primary"
          >
            <span className="flex h-10 items-center justify-center">
              View full details
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

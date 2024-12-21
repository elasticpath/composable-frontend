import Link from "next/link";
import Price from "../product/Price";
import StrikePrice from "../product/StrikePrice";
import { EP_CURRENCY_CODE } from "../../lib/resolve-ep-currency-code";
import Image from "next/image";
import { EyeSlashIcon } from "@heroicons/react/24/solid";
import {
  ShopperProduct,
} from "@elasticpath/react-shopper-hooks";

export default function HitComponent({
  hit,
}: {
  hit: ShopperProduct;
}): JSX.Element {
  const {
    main_image,
    response: {
      meta: { display_price, original_display_price },
      attributes: { name, description },
      id,
    },
  } = hit;

  const ep_main_image_url = main_image?.link.href;

  // const currencyPrice = ep_price?.[EP_CURRENCY_CODE];
  const currencyPrice = display_price?.without_tax.formatted;

  return (
    <>
      <Link href={`/products/${id}`} legacyBehavior>
        <div
          className="group flex h-full cursor-pointer flex-col items-stretch"
          data-testid={id}
        >
          <div className="relative bg-[#f6f7f9] overflow-hidden rounded-t-lg border-l border-r border-t pb-[100%]">
            {ep_main_image_url ? (
              <Image
                className="relative h-full w-full transition duration-300 ease-in-out group-hover:scale-105"
                src={ep_main_image_url}
                alt={name}
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
          <div className="flex h-full flex-col gap-2 rounded-b-lg border-b border-l border-r p-4">
            <div className="h-full">
              <Link href={`/products/${id}`} passHref legacyBehavior>
                <h3 className="text-sm font-bold">{name}</h3>
              </Link>
              <span className="mt-2 line-clamp-6 text-xs font-medium leading-5 text-gray-500">
                {description}
              </span>
            </div>
            <div>
              {currencyPrice && (
                <div className="mt-1 flex items-center">
                  <Price
                    price={display_price?.without_tax.formatted}
                    currency={EP_CURRENCY_CODE}
                  />
                  {original_display_price?.without_tax.formatted && (
                    <StrikePrice
                      price={original_display_price?.without_tax.formatted}
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

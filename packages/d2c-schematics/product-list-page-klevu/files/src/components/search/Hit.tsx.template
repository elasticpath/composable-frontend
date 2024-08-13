import Link from "next/link";
import Price from "../product/Price";
import StrikePrice from "../product/StrikePrice";
import Image from "next/image";
import { EyeSlashIcon } from "@heroicons/react/24/solid";
import { KlevuRecord } from "@klevu/core";

function formatCurrency(price: string, currency: string) {
  return Intl.NumberFormat(undefined, {
    style: "currency",
    currency
  }).format(parseFloat(price));
}

export default function HitComponent({
  hit,
  clickEvent
}: {
  hit: KlevuRecord;
  clickEvent?: (params: { productId: string}) => void
}): JSX.Element {
  const {
    image: ep_main_image_url,
    price,
    salePrice,
    id,
    name,
    shortDesc: description,
    currency
  } = hit;

  return (
    <>
      <Link href={`/products/${id}`} legacyBehavior>
        <div
          className="group flex h-full cursor-pointer flex-col items-stretch"
          data-testid={id}
          onClick={() => clickEvent ? clickEvent({ productId: id}) : null }
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
              {price && (
                <div className="mt-1 flex items-center">
                  <Price
                    price={formatCurrency(salePrice || price, currency)}
                    currency={currency}
                  />
                  {price && (price !== salePrice) && (
                    <StrikePrice
                      price={formatCurrency(price, currency)}
                      currency={currency}
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

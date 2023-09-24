import { SearchHit } from "./SearchHit";
import Link from "next/link";
import Price from "../product/Price";
import StrikePrice from "../product/StrikePrice";
import { EP_CURRENCY_CODE } from "../../lib/resolve-ep-currency-code";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Product from "../product-modal/Product";
import { getProductById } from "../../services/products";
import {
  isChildProductResource,
  isSimpleProductResource,
} from "../../lib/product-helper";
import {
  retrieveBaseProps,
  retrieveChildProps,
  retrieveSimpleProps,
} from "../../lib/retrieve-product-props";
import { IProduct } from "../../lib/types/product-types";
import { GetStaticPropsResult } from "next/types";
import { EyeSlashIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function HitComponent({ hit }: { hit: SearchHit }): JSX.Element {
  const { ep_price, ep_name, objectID, ep_main_image_url, ep_description } =
    hit;

  const currencyPrice = ep_price?.[EP_CURRENCY_CODE];
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const fetchProduct = async (id: string) => {
    const product = await getProductById(id);
    const productData = product.data;
    const retrievedResults = isSimpleProductResource(productData)
      ? retrieveSimpleProps(product)
      : isChildProductResource(productData)
      ? await retrieveChildProps(product)
      : await retrieveBaseProps(product);
    setProductProps(retrievedResults);
  };

  const [productProps, setProductProps] =
    useState<GetStaticPropsResult<IProduct>>();

  useEffect(() => {
    isOpen && fetchProduct(objectID);
  }, [objectID, isOpen]);

  const onSkuIdChange = (id: string) => {
    fetchProduct(id);
  };

  return (
    <>
      <Link href={`/products/${objectID}`}>
        <div
          className="flex h-full cursor-pointer flex-col items-stretch"
          data-testid={objectID}
        >
          <div className="relative overflow-hidden rounded-t-lg border-l border-r border-t pb-[100%]">
            {ep_main_image_url ? (
              <div>
                <Image
                  className="relative h-full w-full"
                  layout="fill"
                  objectFit="cover"
                  src={ep_main_image_url}
                  alt={ep_name}
                />
              </div>
            ) : (
              <div className="absolute flex h-full w-full items-center justify-center bg-gray-200">
                <EyeSlashIcon width={10} height={10} />
              </div>
            )}
          </div>
          <div className="flex h-full flex-col gap-2 rounded-b-lg border-b border-l border-r p-4">
            <div className="h-full">
              <Link href={`/products/${objectID}`} passHref>
                <h3 className="text-sm font-bold">{ep_name}</h3>
              </Link>
              <span className="mt-2 line-clamp-6 text-xs font-medium leading-5 text-gray-500">
                {ep_description}
              </span>
            </div>
            <div>
              {currencyPrice && (
                <div className="mt-1 flex items-center">
                  <Price
                    price={currencyPrice.formatted_price}
                    currency={EP_CURRENCY_CODE}
                  />
                  {currencyPrice.sale_prices && (
                    <StrikePrice
                      price={
                        currencyPrice.sale_prices.original_price.formatted_price
                      }
                      currency={EP_CURRENCY_CODE}
                      size="text-lg"
                    />
                  )}
                </div>
              )}
              <button
                className="primary-btn mt-6 p-4"
                onClick={(e) => {
                  e.preventDefault(), openModal();
                }}
              >
                Quick View
              </button>
            </div>
          </div>
        </div>
      </Link>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="my-12 line-clamp-5 max-w-4xl transform flex-col overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {productProps && "props" in productProps && (
                    <div>
                      <div className="flex justify-end">
                        <div className="nav-button-container flex grow-0 cursor-pointer">
                          <XMarkIcon
                            onClick={() => closeModal()}
                            height={24}
                            width={24}
                          />
                        </div>
                      </div>
                      <Product
                        {...productProps.props}
                        onSkuIdChange={onSkuIdChange}
                      />
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

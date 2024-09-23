"use client";
import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import NoResults from "./NoResults";
import { useDebouncedEffect } from "../../lib/use-debounced";
import { EP_CURRENCY_CODE } from "../../lib/resolve-ep-currency-code";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Dialog, Transition } from "@headlessui/react";
import * as React from "react";
import NoImage from "../NoImage";
import { fetchProducts } from "../../lib/klevu";
import { KlevuRecord } from "@klevu/core";

const SearchBox = ({
  onChange,
  onSearchEnd,
  setHits,
}: {
  onChange: (value: string) => void;
  onSearchEnd: (query: string) => void;
  setHits: React.Dispatch<React.SetStateAction<KlevuRecord[]>>
}) => {
  const [search, setSearch] = useState<string>("");

  const doSearch = async () => {
    const resp = await fetchProducts({}, search);
    setHits(resp.queriesById("search").records);
  }

  useDebouncedEffect(() => { doSearch() }, 400, [search]);

  return (
    <div className="grid h-16 grid-cols-[15%_70%_15%] items-center">
      <div className="pointer-events-none flex h-14 items-center justify-start pl-8">
        <MagnifyingGlassIcon height={16} width={16} />
      </div>
      <input
        className="h-14 border-0 pl-4 outline-none focus:shadow-none"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          onChange(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSearchEnd(search);
          }
        }}
        placeholder="Search"
      />
      <div
        className={clsx(
          "flex",
          "flex-end h-16 w-[4.5rem] items-center",
        )}
      >
        <button
          className="nav-button-container"
          onClick={() => {
            // clear();
            onChange("");
            setSearch("");
          }}
        >
          <XMarkIcon width={24} height={24} />
        </button>
      </div>
    </div>
  );
};

const HitComponent = ({ hit, closeModal }: { hit: KlevuRecord, closeModal: () => void }) => {
  const { price, image, name, sku, id } = hit;

  return (
    <Link
      className="cursor-pointer"
      href={`/products/${id}`}
      legacyBehavior
    >
      <div className="grid h-24 cursor-pointer grid-cols-6 grid-rows-3 gap-2" onClick = {closeModal}>
        <div className="col-span-2 row-span-3 h-24 w-24 relative rounded-lg bg-[#f6f7f9]">
          {image ? (
            <Image
              src={image}
              alt={name}
              className="rounded-lg"
              sizes="(max-width: 96px)"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
          ) : (
            <NoImage />
          )}
        </div>
        <div className="col-span-4">
          <span className="text-sm font-semibold">{name}</span>
        </div>
        <div className="col-span-4">
          <span className="text-xs font-semibold uppercase text-gray-500">
            {sku}
          </span>
        </div>
        <div className="col-span-2">
          {price && (
            <span className="text-sm font-semibold">
              {price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

const Hits = ({ hits, closeModal }: { hits: KlevuRecord[], closeModal: () => void }) => {
  if (hits.length) {
    return (
      <ul className="list-none">
        {hits.map((hit) => (
          <li className="mb-4" key={hit.id}>
            <HitComponent hit={hit} closeModal={closeModal} />
          </li>
        ))}
      </ul>
    );
  }
  return <NoResults />;
};

export const SearchModal = (): JSX.Element => {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const [hits, setHits] = useState<KlevuRecord[]>([])
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <div>
      <button className="flex cursor-pointer justify-start" onClick={openModal}>
        <MagnifyingGlassIcon
          strokeWidth={2}
          width={18}
          height={18}
          className="mr-4 fill-gray-800"
        />
      </button>
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
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 top-0 overflow-y-hidden">
            <div className="mt-32 flex min-h-full items-start justify-center overflow-x-scroll p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform rounded-md bg-white text-left align-middle shadow-xl transition-all">
                  <SearchBox
                    onChange={(value: string) => {
                      setSearchValue(value);
                    }}
                    onSearchEnd={(query) => {
                      closeModal();
                      setSearchValue("");
                      router.push(`/search?q=${query}`);
                    }}
                    setHits={setHits}
                  />
                  {searchValue ? (
                    <div className="max-h-[35rem] overflow-x-hidden overflow-y-scroll px-4 pb-4">
                      <hr />
                      <div className="mt-4">
                        <Hits hits={hits} closeModal={closeModal}/>
                      </div>
                    </div>
                  ) : null}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default SearchModal;
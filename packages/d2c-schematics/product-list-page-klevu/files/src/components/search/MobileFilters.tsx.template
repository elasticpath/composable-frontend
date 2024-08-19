import { BreadcrumbLookup } from "../../lib/types/breadcrumb-lookup";
import { Dialog, Transition } from "@headlessui/react";
import { Dispatch, Fragment, SetStateAction } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import NodeMenu from "./NodeMenu";

interface IMobileFilters {
  lookup?: BreadcrumbLookup;
  showFilterMenu: boolean;
  setShowFilterMenu: Dispatch<SetStateAction<boolean>>;
}

export default function MobileFilters({
  showFilterMenu,
  setShowFilterMenu,
}: IMobileFilters): JSX.Element {
  return (
    <Transition appear show={showFilterMenu} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[9999] px-8"
        onClose={() => setShowFilterMenu(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="overflow-hidde fixed inset-0">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel
                  aria-label="panel"
                  className="pointer-events-auto relative w-screen max-w-xs flex-col bg-white px-6 py-3 transition-all"
                >
                  <div className="flex justify-end">
                    <button
                      className="rounded-md px-4 py-2 transition-all duration-200 hover:bg-slate-200/70 p-1"
                      onClick={() => setShowFilterMenu(false)}
                    >
                      <XMarkIcon height={24} width={24} />
                    </button>
                  </div>

                  <div className="flex w-full flex-col">
                    <span className="pb-2 text-lg font-bold">Category</span>
                    <NodeMenu />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

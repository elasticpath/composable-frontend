"use client";
import { Dispatch, SetStateAction, Fragment, useState } from "react";
import { Transition, Dialog, Disclosure } from "@headlessui/react";
import { NavigationNode } from "@elasticpath/react-shopper-hooks";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import NavItemContent from "./NavItemContent";

interface IProps {
  showMenu: boolean;
  setShowMenu: Dispatch<SetStateAction<boolean>>;
  nav: NavigationNode[];
}

const NavMenu = (props: IProps) => {
  const [expandedDisclosure, setExpandedDisclosure] = useState({
    index: 0,
    open: false,
  });

  // If clicked disclosure isn't the same as the open one, close all other disclosures
  function handleDisclosureChange(state: number) {
    if (state !== expandedDisclosure.index) {
      const panels = [
        ...document.querySelectorAll<HTMLElement>(
          "[aria-expanded=true][aria-label=panel]",
        ),
      ];
      panels.map((panel) => panel.click());
      setExpandedDisclosure({ index: state, open: true });
    }
  }

  return (
    <Transition appear show={props.showMenu} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[9999] px-8"
        onClose={() => props.setShowMenu(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in duration-200"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <Dialog.Panel
            aria-label="panel"
            className="fixed inset-0 flex transform flex-col bg-white px-6 py-3 transition-all"
          >
            <div className="flex justify-end">
              <button
                className="nav-button-container p-1"
                onClick={() => props.setShowMenu(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex w-full flex-col">
              {props.nav &&
                props.nav.map((item, index) => {
                  return (
                    <Disclosure key={index}>
                      {({ open }) => (
                        <>
                          <Disclosure.Button
                            aria-label="panel"
                            className={`${
                              open ? "text-brand-primary" : "text-black"
                            } flex w-full justify-between bg-transparent px-4 py-2 text-left text-base font-bold hover:bg-gray-100`}
                            onClick={() => handleDisclosureChange(index)}
                          >
                            {item.name}
                            <ChevronUpIcon
                              className={`${
                                open ? "rotate-180 transform" : ""
                              } text- h-5 w-5 text-brand-primary`}
                            />
                          </Disclosure.Button>
                          <Disclosure.Panel className="z-50 flex flex-col bg-white px-4 pb-2 pt-4">
                            <NavItemContent
                              item={item}
                              onClose={() => props.setShowMenu(false)}
                            />
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  );
                })}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default NavMenu;

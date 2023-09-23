import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import type { NavigationNode } from "../../../lib/build-site-navigation";
import NavItemContent from "./NavItemContent";

interface INavBar {
  nav: NavigationNode[];
  headerPadding: number;
}

const NavBar = ({ nav }: INavBar): JSX.Element => {
  return (
    <div>
      <div className="flex w-full">
        {nav &&
          nav.map((item: NavigationNode, index) => (
            <Popover key={index} className="relative">
              {({ close }) => (
                <>
                  <Popover.Button className="ui-focus-visible:ring-2 ui-focus-visible:ring-offset-2 mr-4 text-sm font-medium text-black hover:underline focus:text-blue-800 focus:outline-none active:text-blue-800">
                    <span>{item.name}</span>
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute z-10 mt-[1.54rem] w-screen max-w-sm transform px-4 sm:px-0 lg:max-w-2xl">
                      <div className="z-60 overflow-hidden rounded-b-md border border-t-0 bg-white px-8 pt-8 shadow-lg">
                        <NavItemContent item={item} onClose={close} />
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          ))}
      </div>
    </div>
  );
};

export default NavBar;

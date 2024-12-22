"use client";
import { ReactElement } from "react";
import { NavigationNode } from "../../../lib/build-site-navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../../navigation-menu/NavigationMenu";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

export function NavBarPopover({
  nav,
}: {
  nav: NavigationNode[];
}): ReactElement {
  const buildStack = (item: NavigationNode) => {
    return (
      <div key={item.id} className="flex flex-col gap-3 text-sm text-gray-500">
        <span className="font-semibold text-black">{item.name}</span>
        {item.children.map((child: NavigationNode) => (
          <Link
            key={child.id}
            href={`/search${child.href}`}
            legacyBehavior
            passHref
          >
            <NavigationMenuLink className="hover:text-brand-primary hover:underline">
              {child.name}
            </NavigationMenuLink>
          </Link>
        ))}
        <Link href={`/search${item.href}`} legacyBehavior passHref>
          <NavigationMenuLink className="hover:text-brand-primary hover:underline font-semibold">
            Browse All
          </NavigationMenuLink>
        </Link>
      </div>
    );
  };

  return (
    <>
      {nav && (
        <NavigationMenu>
          <NavigationMenuList>
            {nav.map((item: NavigationNode) => {
              return (
                <NavigationMenuItem key={item.id}>
                  <NavigationMenuTrigger className="p-0 ui-focus-visible:ring-2 ui-focus-visible:ring-offset-2 mr-4 text-sm font-medium text-black hover:underline focus:text-brand-primary focus:outline-none active:text-brand-primary">
                    {item.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white">
                    <div className="flex flex-col w-[400px] md:w-[500px] lg:w-[600px] px-8 pt-8">
                      <div className="grid grid-cols-2 gap-y-12 md:grid-cols-3 w-full">
                        {item.children.map(
                          (parent: NavigationNode, index: number) => {
                            return <div key={index}>{buildStack(parent)}</div>;
                          },
                        )}
                      </div>
                      <hr className="my-6"></hr>
                      <Link
                        href={`/search${item.href}`}
                        legacyBehavior
                        passHref
                      >
                        <NavigationMenuLink className="text-sm font-semibold hover:text-brand-primary hover:underline mb-12 flex text-black">
                          Browse All {item.name}
                          <ArrowRightIcon className="ml-1 w-4" />
                        </NavigationMenuLink>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      )}
    </>
  );
}

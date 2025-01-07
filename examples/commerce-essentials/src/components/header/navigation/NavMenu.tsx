"use client";
import { NavigationNode } from "@elasticpath/react-shopper-hooks";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import NavItemContent from "./NavItemContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../accordion/Accordion";
import { cn } from "../../../lib/cn";

interface IProps {
  nav: NavigationNode[];
  setOpen: (open: boolean) => void;
}

const NavMenu = ({ nav, setOpen }: IProps) => {
  return (
    <div className="flex w-full flex-col">
      {nav?.map((item, index) => {
        return (
          <Accordion type="single" collapsible key={index}>
            <AccordionItem value={item.id}>
              <AccordionTrigger
                className={cn(
                  "flex w-full justify-between bg-transparent px-4 py-2 text-left text-base font-bold hover:bg-gray-100 [&[data-state=open]>svg]:rotate-180",
                )}
              >
                {item.name}
                <ChevronUpIcon
                  className={cn(
                    "text- h-5 w-5 text-brand-primary transition-transform duration-200",
                  )}
                />
              </AccordionTrigger>
              <AccordionContent className="z-50 flex flex-col bg-white px-4 pb-2 pt-4">
                <NavItemContent item={item} setOpen={setOpen} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
};

export default NavMenu;

"use client";
import { useState } from "react";
import NavMenu from "./NavMenu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../sheet/Sheet";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { AccountMobileMenu } from "../AccountMobileMenu";
import { Separator } from "../../separator/Separator";
import { MobileAccountSwitcher } from "./MobileAccountSwitcher";
import { NavigationNode } from "../../../lib/build-site-navigation";
import { AccountMemberResponse } from "@epcc-sdk/sdks-shopper";
import { retrieveAccountMemberCredentials } from "../../../lib/retrieve-account-member-credentials";

export function MobileNavBarButton({
  nav,
  account,
  accountMemberTokens,
}: {
  nav: NavigationNode[];
  account?: AccountMemberResponse;
  accountMemberTokens?: ReturnType<typeof retrieveAccountMemberCredentials>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="rounded-md px-4 py-2 transition-all duration-200 hover:bg-slate-200/70"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full bg-white p-0 flex flex-col">
        <SheetHeader className="border-b border-black/10">
          <div></div>
          <SheetTitle tabIndex={0} className="uppercase text-sm font-medium">
            Menu
          </SheetTitle>
          <SheetClose className="ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <XMarkIcon className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>
        <NavMenu nav={nav} setOpen={setOpen} />
        <Separator />
        {account && (
          <>
            <AccountMobileMenu account={account} />
            {accountMemberTokens && (
              <div>
                <MobileAccountSwitcher
                  account={account}
                  accountMemberTokens={accountMemberTokens}
                />
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

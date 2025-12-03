"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { logout } from "../../../app/[lang]/(auth)/actions";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  UserCircleIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { AccountMemberResponse } from "@epcc-sdk/sdks-shopper";
import { retrieveAccountMemberCredentials } from "../../../lib/retrieve-account-member-credentials";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../dropdown-menu/DropdownMenu";
import { cn } from "../../../lib/cn";

export function AccountPopover({
  accountSwitcher,
  account,
  accountMemberTokens,
}: {
  accountSwitcher: ReactNode;
  account?: AccountMemberResponse;
  accountMemberTokens?: ReturnType<typeof retrieveAccountMemberCredentials>;
}) {
  const pathname = usePathname();

  const [open, setOpen] = useState<boolean>(false);

  const isAccountAuthed = account !== undefined;

  function logoutAction() {
    logout();
    setOpen(true);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="nav-button-container inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-black">
        <UserIcon
          className={cn("h-6 w-6", isAccountAuthed && "fill-brand-primary/20")}
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-3">
        <div className="">
          <div className="px-1 py-1">
            {!isAccountAuthed && (
              <>
                <div>
                  <DropdownMenuItem
                    asChild
                    className={cn(
                      pathname.startsWith("/login") && "font-semibold",
                    )}
                  >
                    <Link href={`/login?returnUrl=${pathname}`}>
                      <ArrowRightOnRectangleIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      Login
                    </Link>
                  </DropdownMenuItem>
                </div>
                <div>
                  <DropdownMenuItem
                    asChild
                    className={cn(
                      pathname.startsWith("/register") && "font-semibold",
                    )}
                  >
                    <Link href="/register">
                      <UserPlusIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      Register
                    </Link>
                  </DropdownMenuItem>
                </div>
              </>
            )}
            {isAccountAuthed && (
              <>
                <div>
                  <DropdownMenuItem
                    asChild
                    className={cn(
                      pathname.startsWith("/summary") && "font-semibold",
                    )}
                  >
                    <Link href="/account/summary">
                      <UserCircleIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                </div>
                <div>
                  <DropdownMenuItem
                    asChild
                    className={cn(
                      pathname.startsWith("/orders") && "font-semibold",
                    )}
                  >
                    <Link href="/account/orders">
                      <ClipboardDocumentListIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                </div>
                <div>
                  <DropdownMenuItem
                    asChild
                    className={cn(
                      pathname.startsWith("/addresses") && "font-semibold",
                    )}
                  >
                    <Link href="/account/addresses">
                      <MapPinIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                      Addresses
                    </Link>
                  </DropdownMenuItem>
                </div>
                <div>
                  <form action={logoutAction}>
                    <DropdownMenuItem
                      asChild
                      className={cn(
                        "flex",
                        pathname.startsWith("/logout") && "font-semibold",
                      )}
                    >
                      <button type="submit">
                        <ArrowLeftOnRectangleIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                        Logout
                      </button>
                    </DropdownMenuItem>
                  </form>
                </div>
              </>
            )}
          </div>
          {accountMemberTokens &&
            Object.keys(accountMemberTokens).length > 1 && (
              <div className="px-1 py-1">
                <>
                  <span className="text-[0.625rem] uppercase font-medium px-2">
                    Use store as...
                  </span>
                  {accountSwitcher}
                </>
              </div>
            )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../dropdown-menu/DropdownMenu";
import { cn } from "../../../lib/cn";

export function AccountPopover({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-black">
        <UserIcon
          className={cn("h-6 w-6", isAuthenticated && "fill-[#2BCC7E]/20")}
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-3">
        <div className="px-1 py-1">
          {!isAuthenticated && (
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
          {isAuthenticated && (
            <>
              <div>
                <DropdownMenuItem
                  asChild
                  className={cn(
                    pathname.startsWith("/account") && "font-semibold",
                  )}
                >
                  <Link href="/account">
                    <UserCircleIcon
                      className="mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                    My Account
                  </Link>
                </DropdownMenuItem>
              </div>
              <div>
                <form action="/api/logout" method="POST">
                  <DropdownMenuItem
                    asChild
                    className="flex"
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

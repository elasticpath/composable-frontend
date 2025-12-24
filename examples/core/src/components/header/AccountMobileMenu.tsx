"use client";
import { useParams, usePathname } from "next/navigation";
import { LocaleLink } from "../LocaleLink";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  UserCircleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { logout } from "../../app/[lang]/(auth)/actions";
import { SheetClose } from "../sheet/Sheet";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";
import { AccountMemberResponse } from "@epcc-sdk/sdks-shopper";

export function AccountMobileMenu({
  account,
}: {
  account: AccountMemberResponse;
}) {
  const { lang } = useParams();
  const pathname = usePathname();

  const isAccountAuthed = !!account;

  return (
    <div>
      {!isAccountAuthed && (
        <>
          <div>
            <SheetClose asChild>
              <AccountMenuButton
                pathname={{ target: "/login", current: pathname }}
                asChild
              >
                <LocaleLink href={`/login?returnUrl=${pathname}`}>
                  <ArrowRightOnRectangleIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Login
                </LocaleLink>
              </AccountMenuButton>
            </SheetClose>
          </div>
          <div>
            <SheetClose asChild>
              <AccountMenuButton
                pathname={{ target: "/register", current: pathname }}
                asChild
              >
                <LocaleLink href="/register">
                  <UserPlusIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Register
                </LocaleLink>
              </AccountMenuButton>
            </SheetClose>
          </div>
        </>
      )}
      {isAccountAuthed && (
        <>
          <div>
            <SheetClose asChild>
              <AccountMenuButton
                pathname={{ target: "/account/summary", current: pathname }}
                asChild
              >
                <LocaleLink href="/account/summary">
                  <UserCircleIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  My Account
                </LocaleLink>
              </AccountMenuButton>
            </SheetClose>
          </div>
          <div>
            <SheetClose asChild>
              <AccountMenuButton
                pathname={{ target: "/account/orders", current: pathname }}
                asChild
              >
                <LocaleLink href="/account/orders">
                  <ClipboardDocumentListIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Orders
                </LocaleLink>
              </AccountMenuButton>
            </SheetClose>
          </div>
          <div>
            <SheetClose asChild>
              <AccountMenuButton
                pathname={{ target: "/account/addresses", current: pathname }}
                asChild
              >
                <LocaleLink href="/account/addresses">
                  <MapPinIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Addresses
                </LocaleLink>
              </AccountMenuButton>
            </SheetClose>
          </div>
          <div>
            <SheetClose asChild>
              <AccountMenuButton
                pathname={{
                  target: "/logout",
                  current: pathname,
                }}
                onClick={() => logout(lang as string, pathname)}
              >
                <ArrowLeftOnRectangleIcon
                  className="mr-2 h-5 w-5"
                  aria-hidden="true"
                />
                Logout
              </AccountMenuButton>
            </SheetClose>
          </div>
        </>
      )}
    </div>
  );
}

export interface AccountMenuButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  pathname?: {
    target: string;
    current: string;
  };
}

const AccountMenuButton = forwardRef<HTMLButtonElement, AccountMenuButtonProps>(
  ({ className, pathname, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          `${
            pathname && pathname.current.startsWith(pathname.target)
              ? "font-semibold"
              : "text-gray-900"
          } group flex w-full items-center px-2 py-2 text-sm hover:bg-brand-primary hover:text-white transition-color ease-in-out duration-100`,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
AccountMenuButton.displayName = "AccountMenuButton";

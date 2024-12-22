import { useAuthedAccountMember } from "@elasticpath/react-shopper-hooks";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  UserCircleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { logout } from "../../app/(auth)/actions";
import { SheetClose } from "../sheet/Sheet";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";

export function AccountMobileMenu() {
  const { data } = useAuthedAccountMember();

  const pathname = usePathname();

  const isAccountAuthed = !!data;

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
                <Link href={`/login?returnUrl=${pathname}`}>
                  <ArrowRightOnRectangleIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Login
                </Link>
              </AccountMenuButton>
            </SheetClose>
          </div>
          <div>
            <SheetClose asChild>
              <AccountMenuButton
                pathname={{ target: "/register", current: pathname }}
                asChild
              >
                <Link href="/register">
                  <UserPlusIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Register
                </Link>
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
                <Link href="/account/summary">
                  <UserCircleIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  My Account
                </Link>
              </AccountMenuButton>
            </SheetClose>
          </div>
          <div>
            <SheetClose asChild>
              <AccountMenuButton
                pathname={{ target: "/account/orders", current: pathname }}
                asChild
              >
                <Link href="/account/orders">
                  <ClipboardDocumentListIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Orders
                </Link>
              </AccountMenuButton>
            </SheetClose>
          </div>
          <div>
            <SheetClose asChild>
              <AccountMenuButton
                pathname={{ target: "/account/addresses", current: pathname }}
                asChild
              >
                <Link href="/account/addresses">
                  <MapPinIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Addresses
                </Link>
              </AccountMenuButton>
            </SheetClose>
          </div>
          <div>
            <form action={logout}>
              <SheetClose asChild>
                <AccountMenuButton
                  pathname={{
                    target: "/logout",
                    current: pathname,
                  }}
                  formAction={logout}
                  type="submit"
                >
                  <ArrowLeftOnRectangleIcon
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Logout
                </AccountMenuButton>
              </SheetClose>
            </form>
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

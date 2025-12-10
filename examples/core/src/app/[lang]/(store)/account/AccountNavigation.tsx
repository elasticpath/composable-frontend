"use client";
import { LocaleLink } from "src/components/LocaleLink";
import { useParams, usePathname } from "next/navigation";
import { Button } from "src/components/button/Button";
import { logout } from "../../(auth)/actions";
import { useTransition } from "react";

export function AccountNavigation() {
  const { lang } = useParams();
  const pathname = usePathname();
  const [_isPending, startTransition] = useTransition();

  return (
    <nav className="flex flex-1 flex-col" aria-label="Sidebar">
      <ul role="list" className="space-y-5">
        <li>
          <Button
            className="w-full justify-start"
            asChild
            reversed={!pathname.startsWith("/account/summary")}
          >
            <LocaleLink href="/account/summary">Account Info</LocaleLink>
          </Button>
        </li>
        <li>
          <Button
            className="w-full justify-start"
            asChild
            reversed={!pathname.startsWith("/account/orders")}
          >
            <LocaleLink href="/account/orders">My Orders</LocaleLink>
          </Button>
        </li>
        <li>
          <Button
            className="w-full justify-start"
            asChild
            reversed={!pathname.startsWith("/account/addresses")}
          >
            <LocaleLink href="/account/addresses">Addresses</LocaleLink>
          </Button>
        </li>
        <li>
          <Button
            className="w-full justify-start"
            reversed={true}
            onClick={() => startTransition(() => logout(lang as string))}
          >
            Logout
          </Button>
        </li>
      </ul>
    </nav>
  );
}

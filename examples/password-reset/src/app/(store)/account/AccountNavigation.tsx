"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../../../components/button/Button";
import { logout } from "../../(auth)/actions";
import { useTransition } from "react";

export function AccountNavigation() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <nav className="flex flex-1 flex-col" aria-label="Sidebar">
      <ul role="list" className="space-y-5">
        <li>
          <Button
            className="w-full justify-start"
            asChild
            reversed={!pathname.startsWith("/account/summary")}
          >
            <Link href="/account/summary">Account Info</Link>
          </Button>
        </li>
        <li>
          <Button
            className="w-full justify-start"
            asChild
            reversed={!pathname.startsWith("/account/orders")}
          >
            <Link href="/account/orders">My Orders</Link>
          </Button>
        </li>
        <li>
          <Button
            className="w-full justify-start"
            asChild
            reversed={!pathname.startsWith("/account/addresses")}
          >
            <Link href="/account/addresses">Addresses</Link>
          </Button>
        </li>
        <li>
          <Button
            className="w-full justify-start"
            reversed={true}
            onClick={() => startTransition(() => logout())}
          >
            Logout
          </Button>
        </li>
      </ul>
    </nav>
  );
}

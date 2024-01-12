"use server";
import Link from "next/link";
import EpIcon from "../../icons/ep-icon";
import { MobileNavBarButton } from "./MobileNavBarButton";
import { getServerSideImplicitClient } from "../../../lib/epcc-server-side-implicit-client";
import { buildSiteNavigation } from "../../../lib/build-site-navigation";
import { Cart } from "../../cart/CartSheet";

export default async function MobileNavBar() {
  const client = getServerSideImplicitClient();
  const nav = await buildSiteNavigation(client);

  return (
    <div>
      <div className="flex w-full items-center justify-between md:hidden">
        <div className="grid w-full grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center">
            <MobileNavBarButton nav={nav} />
          </div>
          <Link href="/" aria-label="Go to home page">
            <EpIcon className="min-w-10 relative h-10 w-10" />
          </Link>
          <div className="justify-self-end">
            <div className="flex gap-4">
              <Cart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

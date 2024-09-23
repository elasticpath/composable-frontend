"use server";
import { NavBarPopover } from "./NavBarPopover";
import { getServerSideImplicitClient } from "../../../lib/epcc-server-side-implicit-client";
import { buildSiteNavigation } from "@elasticpath/react-shopper-hooks";

export default async function NavBar() {
  const client = getServerSideImplicitClient();
  const nav = await buildSiteNavigation(client);

  return (
    <div>
      <div className="flex w-full">
        <NavBarPopover nav={nav} />
      </div>
    </div>
  );
}

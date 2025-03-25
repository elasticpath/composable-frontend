"use server";
import { NavBarPopover } from "./NavBarPopover";
import { buildSiteNavigation } from "../../../lib/build-site-navigation";
import { createElasticPathClient } from "../../../app/(store)/membership/create-elastic-path-client";

export default async function NavBar() {
  const client = await createElasticPathClient();
  const nav = await buildSiteNavigation(client);

  return (
    <div>
      <div className="flex w-full">
        <NavBarPopover nav={nav} />
      </div>
    </div>
  );
}

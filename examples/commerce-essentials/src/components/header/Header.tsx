import MobileNavBar from "./navigation/MobileNavBar";
import NavBar from "./navigation/NavBar";
import Link from "next/link";
import EpIcon from "../icons/ep-icon";
import { Suspense } from "react";
import { AccountMenu } from "./account/AccountMenu";
import { AccountSwitcher } from "./account/AccountSwitcher";
import { Cart } from "../cart/CartSheet";

import SearchModal from "../search/SearchModal";

const Header = (): JSX.Element => {
  return (
    <div className="sticky z-40 border-b border-gray-200 bg-white p-4">
      <Suspense>
        <MobileNavBar />
      </Suspense>
      <div className="hidden w-full items-center justify-between md:flex">
        <div className="flex min-w-[4rem]">
          <Link href="/" aria-label="Go to home page">
            <EpIcon className="min-w-10 h-10 w-10 relative" />
          </Link>
        </div>
        <div className="w-full max-w-base-max-width">
          <Suspense>
            <div>
              <NavBar />
            </div>
          </Suspense>
        </div>
        <div className="flex items-center self-center gap-x-2">
          
          <SearchModal />
          <AccountMenu accountSwitcher={<AccountSwitcher />} />
          <Cart />
        </div>
      </div>
    </div>
  );
};

export default Header;

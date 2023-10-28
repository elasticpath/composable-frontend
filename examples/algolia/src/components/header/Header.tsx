import MobileNavBar from "./navigation/MobileNavBar";
import SearchModal from "../search/SearchModal";
import NavBar from "./navigation/NavBar";
import Link from "next/link";
import CartMenu from "./cart/CartMenu";
import EpIcon from "../icons/ep-icon";
import { Suspense } from "react";

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
        <div className="flex items-center self-center">
          <SearchModal />
          <CartMenu />
        </div>
      </div>
    </div>
  );
};

export default Header;

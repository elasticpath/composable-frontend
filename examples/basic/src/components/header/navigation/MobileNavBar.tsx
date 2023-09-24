import Link from "next/link";
import { NavigationNode } from "../../../lib/build-site-navigation";

// TODO conditionally include the search modal - include search?
// import SearchModal from "../../search/SearchModal";
import CartMenu from "../cart/CartMenu";
import EpIcon from "../../../../public/icons/ep-icon.svg";
import { useState } from "react";
import NavMenu from "./NavMenu";

interface IMobileNavBar {
  nav: NavigationNode[];
}

const MobileNavBar = ({ nav }: IMobileNavBar): JSX.Element => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div>
      {/* React */}
      <div className="flex w-full items-center justify-between md:hidden">
        <div className="grid w-full grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center">
            <button
              className="nav-button-container"
              onClick={() => setShowMenu(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
            <NavMenu showMenu={showMenu} setShowMenu={setShowMenu} nav={nav} />
          </div>
          <Link href="/">
            <a aria-label="Go to home page">
              <div className="min-w-10 relative h-10 w-10">
                <EpIcon />
              </div>
            </a>
          </Link>
          <div className="justify-self-end">
            <div className="flex gap-4">
              <CartMenu />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavBar;

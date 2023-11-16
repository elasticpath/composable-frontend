"use client";
import { useState } from "react";
import NavMenu from "./NavMenu";
import { NavigationNode } from "@elasticpath/react-shopper-hooks";

export function MobileNavBarButton({ nav }: { nav: NavigationNode[] }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
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
    </>
  );
}

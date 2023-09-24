import { NavigationNode } from "../../lib/build-site-navigation";
import MobileNavBar from "./navigation/MobileNavBar";
import EpIcon from "../../../public/icons/ep-icon.svg";
import NavBar from "./navigation/NavBar";
import Link from "next/link";
import CartMenu from "./cart/CartMenu";

interface IHeader {
  nav: NavigationNode[];
}

const Header = ({ nav }: IHeader): JSX.Element => {
  const headerPadding = 4;

  return (
    <div className="sticky z-40 border-b border-gray-200 bg-white p-4">
      <MobileNavBar nav={nav} />
      <div className="hidden w-full items-center justify-between md:flex">
        <div className="flex min-w-[4rem]">
          <Link href="/">
            <a aria-label="Go to home page">
              <div className="min-w-10 relative h-10 w-10">
                <EpIcon />
              </div>
            </a>
          </Link>
        </div>
        <div className="w-full max-w-base-max-width">
          <NavBar nav={nav} headerPadding={headerPadding} />
        </div>
        <div className="flex items-center self-center">
          <CartMenu />
        </div>
      </div>
    </div>
  );
};

export default Header;

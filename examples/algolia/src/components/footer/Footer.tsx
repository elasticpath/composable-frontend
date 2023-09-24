import GithubIcon from "../../../public/icons/github.svg";
import EpLogo from "../../../public/icons/ep-logo.svg";
import Link from "next/link";
import { PhoneIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

const Footer = (): JSX.Element => (
  <div>
    <div className="flex justify-center border-t border-gray-200 bg-white">
      <div className="grid w-full max-w-base-max-width grid-cols-1 justify-between gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-5">
        <div className="flex">
          <EpLogo width={120} height={40} />
        </div>
        <div className="flex flex-col justify-start">
          <Link href="/">
            <a className="hover:underline">Home</a>
          </Link>
          <Link href="/shipping">
            <a className="hover:underline">Shipping</a>
          </Link>
          <Link href="/faq">
            <a className="hover:underline">FAQ</a>
          </Link>
        </div>
        <div className="flex flex-col justify-start">
          <Link href="/about">
            <a className="hover:underline">About</a>
          </Link>
          <Link href="/terms">
            <a className="hover:underline">Terms</a>
          </Link>
        </div>
        <div className="justify-start" />
        <div className="flex items-center justify-end gap-4 self-start">
          <Link
            href="https://github.com/elasticpath/d2c-reference-store"
            aria-label="Go to repository on github"
            className="flex items-center justify-center"
            passHref
          >
            <a>
              {" "}
              <GithubIcon
                className="hover:fill-blue-800"
                width={22}
                height={22}
              />
            </a>
          </Link>
          <Link
            href="https://www.elasticpath.com"
            aria-label="Go to Elasticpath home page"
            passHref
          >
            <a>
              {" "}
              <InformationCircleIcon
                className="hover:fill-blue-800"
                width={25}
                height={25}
              />
            </a>
          </Link>
          <Link
            href="https://www.elasticpath.com/company/contact-us#contact-information"
            aria-label="Go to Elasticpath contact us page"
            passHref
          >
            <a>
              <PhoneIcon
                className="hover:fill-blue-800"
                width={25}
                height={25}
              />
            </a>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default Footer;

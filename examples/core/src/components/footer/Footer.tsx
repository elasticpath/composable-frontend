"use client";
import Link from "next/link";
import { LocaleLink } from "../LocaleLink";
import { PhoneIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { GitHubIcon } from "../icons/github-icon";
import EpLogo from "../icons/ep-logo";

import type { JSX } from "react";

const Footer = (): JSX.Element => {
  return (
    <div>
      <div className="flex justify-center border-t border-gray-200 bg-white">
        <div className="grid w-full max-w-base-max-width grid-cols-1 justify-between gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-5">
          <div className="flex">
            <EpLogo className="w-28" />
          </div>
          <div className="flex flex-col justify-start">
            <LocaleLink href="/" className="hover:underline">
              Home
            </LocaleLink>
            <LocaleLink href="/shipping" className="hover:underline">
              Shipping
            </LocaleLink>
            <LocaleLink href="/faq" className="hover:underline">
              FAQ
            </LocaleLink>
          </div>
          <div className="flex flex-col justify-start">
            <LocaleLink href="/about" className="hover:underline">
              About
            </LocaleLink>
            <LocaleLink href="/terms" className="hover:underline">
              Terms
            </LocaleLink>
            <LocaleLink href="/support" className="hover:underline">
              Support
            </LocaleLink>
          </div>
          <div className="justify-start" />
          <div className="flex items-center justify-end gap-4 self-start">
            <Link
              href="https://github.com/elasticpath/d2c-reference-store"
              aria-label="Go to repository on github"
              className="flex items-center justify-center"
              passHref
            >
              {" "}
              <GitHubIcon className="w-5 h-5 hover:fill-brand-primary" />
            </Link>
            <Link
              href="https://www.elasticpath.com"
              aria-label="Go to Elasticpath home page"
              passHref
            >
              {" "}
              <InformationCircleIcon
                className="hover:fill-brand-primary"
                width={25}
                height={25}
              />
            </Link>
            <Link
              href="https://www.elasticpath.com/company/contact-us#contact-information"
              aria-label="Go to Elasticpath contact us page"
              passHref
            >
              <PhoneIcon
                className="hover:fill-brand-primary"
                width={25}
                height={25}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;

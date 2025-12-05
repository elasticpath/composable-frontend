"use client";

import { useParams } from "next/navigation";
import Link, { LinkProps } from "next/link";
import React from "react";

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

type Props = LinkProps &
  AnchorProps & {
    children: React.ReactNode;
  };

export function LocaleLink({ href, children, className, ...props }: Props) {
  const { lang } = useParams();

  const localizedHref =
    lang && typeof href === "string" && href.startsWith("/")
      ? `/${lang}${href}`
      : href;

  return (
    <Link href={localizedHref} {...props} className={className}>
      {children}
    </Link>
  );
}

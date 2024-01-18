"use client";

import { HomeIcon } from "@heroicons/react/20/solid";
import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current: boolean;
}

export function Breadcrumb() {
  const pathname = usePathname();

  const pathnameParts = pathname.split("/").filter(Boolean);

  // Function to convert pathname to breadcrumb items
  const getBreadcrumbItems = (pathname: string): BreadcrumbItem[] => {
    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");

    return pathSegments.map((segment, index) => {
      const href =
        segment === "account"
          ? undefined
          : `/${pathSegments.slice(0, index + 1).join("/")}`;
      return {
        label: segment,
        href,
        current: index === pathSegments.length - 1, // Set current to true for the last segment
      };
    });
  };

  const breadcrumbItems = getBreadcrumbItems(pathname);

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <Link
              href="/"
              className="text-gray-400 hover:text-brand-highlight transition-colors duration-150"
            >
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {breadcrumbItems.map((page) => (
          <li key={page.label}>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              {page.href ? (
                <Link
                  href={page.href}
                  className={clsx(
                    page.current ? "text-brand-primary" : "text-gray-500",
                    "ml-4 text-sm font-medium hover:text-brand-highlight transition-colors duration-150",
                  )}
                  aria-current={page.current ? "page" : undefined}
                >
                  {page.label}
                </Link>
              ) : (
                <span className="ml-4 text-sm text-black">{page.label}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

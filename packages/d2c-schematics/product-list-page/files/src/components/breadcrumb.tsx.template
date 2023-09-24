import { BreadcrumbEntry } from "../lib/create-breadcrumb";
import Link from "next/link";

interface IBreadcrumb {
  entries: BreadcrumbEntry[];
}

export default function Breadcrumb({ entries }: IBreadcrumb): JSX.Element {
  return (
    <ol className="m-0 flex list-none gap-4">
      {entries.length > 1 &&
        entries.map((entry, index, array) => (
          <li className="text-xs md:text-sm" key={entry.breadcrumb}>
            {array.length === index + 1 ? (
              <span className="font-bold">{entry.label}</span>
            ) : (
              <Link href={`/search/${entry.breadcrumb}`} passHref>
                <a className="text-gray-500 hover:text-brand-primary">
                  {entry.label}
                </a>
              </Link>
            )}
            {array.length !== index + 1 && <span className="ml-4">/</span>}
          </li>
        ))}
    </ol>
  );
}

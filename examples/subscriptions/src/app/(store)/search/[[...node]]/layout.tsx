import { ReactNode } from "react";
import Breadcrumb from "../../../../components/breadcrumb";

export default function SearchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-4 mx-auto max-w-7xl">
      <Breadcrumb />
      {children}
    </div>
  );
}

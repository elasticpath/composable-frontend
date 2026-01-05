import { ReactNode } from "react";
import { AccountNavigation } from "./AccountNavigation";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white">
      <div className="py-10 px-5 sm:py-20 sm:px-10">
        <div className="flex justify-center gap-20">
          <div className="hidden xl:block">
            <AccountNavigation />
          </div>
          <div className="w-full sm:w-[39rem]">{children}</div>
        </div>
      </div>
    </div>
  );
}

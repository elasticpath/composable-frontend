import { Separator } from "../../../components/separator/Separator";
import Link from "next/link";
import EpLogo from "../../../components/icons/ep-logo";
import * as React from "react";

export function CheckoutFooter() {
  return (
    <div className="flex flex-col gap-4">
      <Separator />
      <div className="flex flex-row gap-y-4 gap-x-10 flex-wrap">
        <Link href="#" className="font-sm">
          Refund Policy
        </Link>
        <Link href="#" className="font-sm">
          Shipping Policy
        </Link>
        <Link href="#" className="font-sm">
          Privacy Policy
        </Link>
        <Link href="#" className="font-sm">
          Terms of Service
        </Link>
      </div>
      <div className="flex flex-row items-center items-start gap-2 flex-wrap">
        <span className="text-xs text-black/40">Powered by</span>
        <EpLogo className="h-5 w-auto" />
      </div>
    </div>
  );
}

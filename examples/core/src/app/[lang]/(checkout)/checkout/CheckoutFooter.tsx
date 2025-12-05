import { Separator } from "src/components/separator/Separator";
import { LocaleLink } from "src/components/LocaleLink";
import EpLogo from "src/components/icons/ep-logo";
import * as React from "react";

export function CheckoutFooter() {
  return (
    <div className="flex flex-col gap-4">
      <Separator />
      <div className="flex flex-row gap-y-4 gap-x-10 flex-wrap">
        <LocaleLink href="#" className="font-sm">
          Refund Policy
        </LocaleLink>
        <LocaleLink href="#" className="font-sm">
          Shipping Policy
        </LocaleLink>
        <LocaleLink href="#" className="font-sm">
          Privacy Policy
        </LocaleLink>
        <LocaleLink href="#" className="font-sm">
          Terms of Service
        </LocaleLink>
      </div>
      <div className="flex flex-row items-center items-start gap-2 flex-wrap">
        <span className="text-xs text-black/40">Powered by</span>
        <EpLogo className="h-5 w-auto" />
      </div>
    </div>
  );
}

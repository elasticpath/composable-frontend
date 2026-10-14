"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../button/Button";
import {
  CONSENT_COOKIE_LIFETIME_SECONDS,
  CONSENT_COOKIE_NAME,
  GRANT_ALL_CONSENT_COOKIE_VALUE,
} from "../../lib/visitor/consent-cookie";

export function ConsentBanner({ answered }: { answered: boolean }) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(answered);

  if (dismissed) {
    return null;
  }

  function accept() {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CONSENT_COOKIE_NAME}=${GRANT_ALL_CONSENT_COOKIE_VALUE}; Path=/; Max-Age=${CONSENT_COOKIE_LIFETIME_SECONDS}; SameSite=Lax${secure}`;
    setDismissed(true);
    router.refresh();
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      data-testid="consent-banner"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-base-max-width flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-black/80">
          This store is a demo of a consent banner. If you accept, it keeps a
          visitor id in a cookie and sends it to Elastic Path with the purposes
          you agreed to: analytics and personalization.
        </p>
        <Button size="small" onClick={accept}>
          Accept
        </Button>
      </div>
    </div>
  );
}

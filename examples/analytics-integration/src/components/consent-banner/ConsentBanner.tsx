"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PURPOSE_ANALYTICS, PURPOSE_PERSONALIZATION } from "@epcc-sdk/visitor";
import type { Purpose } from "@epcc-sdk/visitor";
import { Button } from "../button/Button";
import {
  CONSENT_COOKIE_LIFETIME_SECONDS,
  CONSENT_COOKIE_NAME,
  PURPOSES,
  consentCookieValueFor,
} from "../../lib/visitor/consent-cookie";
import { OPEN_CONSENT_BANNER_EVENT } from "./open-consent-banner-event";

const PURPOSE_LABELS: Record<Purpose, string> = {
  [PURPOSE_ANALYTICS]: "Analytics",
  [PURPOSE_PERSONALIZATION]: "Personalization",
};

export function ConsentBanner({ answered }: { answered: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(!answered);
  const [customizing, setCustomizing] = useState(false);
  const [chosen, setChosen] = useState<Purpose[]>([]);

  useEffect(() => {
    const openBanner = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_BANNER_EVENT, openBanner);
    return () =>
      window.removeEventListener(OPEN_CONSENT_BANNER_EVENT, openBanner);
  }, []);

  if (!open) {
    return null;
  }

  function choose(purposes: Purpose[]) {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CONSENT_COOKIE_NAME}=${consentCookieValueFor(purposes)}; Path=/; Max-Age=${CONSENT_COOKIE_LIFETIME_SECONDS}; SameSite=Lax${secure}`;
    setOpen(false);
    setCustomizing(false);
    router.refresh();
  }

  function toggle(purpose: Purpose) {
    setChosen((current) =>
      current.includes(purpose)
        ? current.filter((item) => item !== purpose)
        : [...current, purpose],
    );
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      data-testid="consent-banner"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-base-max-width flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-black/80">
            This store is a demo of a consent banner. If you accept, it keeps a
            visitor id in a cookie and sends it to Elastic Path with the
            purposes you agreed to: analytics and personalization. If you
            reject, it sends no visitor id.
          </p>
          {customizing && (
            <fieldset className="flex gap-4 text-sm">
              <legend className="sr-only">Purposes</legend>
              {PURPOSES.map((purpose) => (
                <label key={purpose} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={purpose}
                    checked={chosen.includes(purpose)}
                    onChange={() => toggle(purpose)}
                  />
                  {PURPOSE_LABELS[purpose]}
                </label>
              ))}
            </fieldset>
          )}
        </div>
        <div className="flex gap-2">
          {customizing ? (
            <Button size="small" onClick={() => choose(chosen)}>
              Save choices
            </Button>
          ) : (
            <>
              <Button size="small" onClick={() => choose(PURPOSES)}>
                Accept all
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setCustomizing(true)}
              >
                Customize
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => choose([])}
              >
                Reject all
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { OPEN_CONSENT_BANNER_EVENT } from "./open-consent-banner-event";

export function ConsentSettingsLink() {
  return (
    <button
      type="button"
      className="text-left hover:underline"
      data-testid="consent-settings-link"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_BANNER_EVENT))}
    >
      Cookie settings
    </button>
  );
}

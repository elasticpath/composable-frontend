import { useState } from "react"
import {
  ACCEPTED_ALL_VALUE,
  REJECTED_VALUE,
  readConsentAnswer,
  writeConsentAnswer,
} from "./consent-cookie"
import "./ConsentBanner.css"

export function ConsentBanner() {
  const [open, setOpen] = useState(() => readConsentAnswer() === undefined)

  function choose(value: string) {
    writeConsentAnswer(value)
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        className="consent-settings-link"
        data-testid="consent-settings-link"
        onClick={() => setOpen(true)}
      >
        Cookie settings
      </button>
    )
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      data-testid="consent-banner"
      className="consent-banner"
    >
      <p>
        This store is a demo of a consent banner. If you accept, it keeps a
        visitor id in a cookie and sends it to Elastic Path with the purposes
        you agreed to: analytics and personalization. If you ignore the banner,
        it sends an id that lives in the page and is lost when the page loads
        again. If you reject, it sends no visitor id.
      </p>
      <div className="consent-banner-actions">
        <button type="button" onClick={() => choose(ACCEPTED_ALL_VALUE)}>
          Accept all
        </button>
        <button type="button" onClick={() => choose(REJECTED_VALUE)}>
          Reject all
        </button>
      </div>
    </div>
  )
}

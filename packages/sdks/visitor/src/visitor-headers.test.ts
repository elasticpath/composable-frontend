import { describe, expect, it } from "vitest"
import {
  ANALYTICS_HEADER,
  CONSENT_NONE,
  PURPOSE_ANALYTICS,
  PURPOSE_PERSONALIZATION,
  SESSION_VISITOR_COOKIE,
  VISITOR_CONSENT_HEADER,
  VISITOR_COOKIE,
  VISITOR_ID_HEADER,
} from "./constants"
import { visitorHeaders } from "./visitor-headers"

const id = "0123456789abcdef0123456789abcdef"

describe("visitorHeaders", () => {
  it("sends the id and the granted purposes, comma-separated, for a lasting visitor", () => {
    expect(
      visitorHeaders({
        kind: "lasting",
        id,
        purposes: ["analytics", "personalization"],
      }),
    ).toEqual({
      "EP-Visitor-Id": id,
      "EP-Visitor-Consent": "analytics,personalization",
    })
  })

  it("sends only the purposes the shopper granted", () => {
    expect(
      visitorHeaders({ kind: "lasting", id, purposes: ["personalization"] }),
    ).toEqual({
      "EP-Visitor-Id": id,
      "EP-Visitor-Consent": "personalization",
    })
  })

  it("sends the id with consent none for a session visitor", () => {
    expect(visitorHeaders({ kind: "session", id })).toEqual({
      "EP-Visitor-Id": id,
      "EP-Visitor-Consent": "none",
    })
  })

  it.each([["none"], ["objected"]] as const)(
    "sends no visitor headers for a %s visitor",
    (kind) => {
      expect(visitorHeaders({ kind })).toEqual({})
    },
  )
})

describe("exported constants", () => {
  it("name the cookies, headers and purposes of the contract", () => {
    expect({
      VISITOR_COOKIE,
      SESSION_VISITOR_COOKIE,
      VISITOR_ID_HEADER,
      VISITOR_CONSENT_HEADER,
      ANALYTICS_HEADER,
      PURPOSE_ANALYTICS,
      PURPOSE_PERSONALIZATION,
      CONSENT_NONE,
    }).toEqual({
      VISITOR_COOKIE: "ep_vid",
      SESSION_VISITOR_COOKIE: "ep_vsid",
      VISITOR_ID_HEADER: "EP-Visitor-Id",
      VISITOR_CONSENT_HEADER: "EP-Visitor-Consent",
      ANALYTICS_HEADER: "EP-Analytics",
      PURPOSE_ANALYTICS: "analytics",
      PURPOSE_PERSONALIZATION: "personalization",
      CONSENT_NONE: "none",
    })
  })
})

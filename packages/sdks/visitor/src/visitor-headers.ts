import {
  CONSENT_NONE,
  VISITOR_CONSENT_HEADER,
  VISITOR_ID_HEADER,
} from "./constants"
import type { Visitor } from "./types"

export function visitorHeaders(visitor: Visitor): Record<string, string> {
  switch (visitor.kind) {
    case "lasting":
      return {
        [VISITOR_ID_HEADER]: visitor.id,
        [VISITOR_CONSENT_HEADER]: visitor.purposes.join(","),
      }
    case "session":
      return {
        [VISITOR_ID_HEADER]: visitor.id,
        [VISITOR_CONSENT_HEADER]: CONSENT_NONE,
      }
    case "none":
    case "objected":
      return {}
  }
}

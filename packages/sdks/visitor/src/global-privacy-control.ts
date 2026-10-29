import { GLOBAL_PRIVACY_CONTROL_HEADER } from "./constants"

export function hasGlobalPrivacyControl(request: Request): boolean {
  return request.headers.get(GLOBAL_PRIVACY_CONTROL_HEADER) === "1"
}

import { CREDENTIALS_COOKIE_KEY } from "../app/constants"

export async function readCredentials() {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers")
    return (await cookies()).get(CREDENTIALS_COOKIE_KEY)?.value ?? ""
  } else {
    const cookies = (await import("js-cookie")).default
    return cookies.get(CREDENTIALS_COOKIE_KEY) ?? ""
  }
}

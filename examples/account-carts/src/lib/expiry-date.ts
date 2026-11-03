export const NO_EXPIRY_DATE = "No expiry date"

export function formatExpiryDate(expiresAt: string | undefined): string {
  const time = expiresAt ? Date.parse(expiresAt) : Number.NaN

  if (Number.isNaN(time)) return NO_EXPIRY_DATE

  return new Date(time).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

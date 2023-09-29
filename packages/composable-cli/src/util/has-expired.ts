/**
 *
 * @param expiresTimestamp in unix time
 * @param threshold in seconds
 */
export function hasExpiredWithThreshold(
  expiresTimestamp: number,
  threshold: number,
): boolean {
  const currentTimestamp = Math.floor(Date.now() / 1000) // Convert current time to Unix timestamp
  return expiresTimestamp - threshold <= currentTimestamp
}

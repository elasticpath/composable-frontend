/**
 *
 * @param timestamp in unix time
 * @param expiresIn in seconds
 * @param threshold in seconds
 */
export function hasExpiredWithThreshold(
  timestamp: number,
  expiresIn: number,
  threshold: number
): boolean {
  const currentTimestamp = Math.floor(Date.now() / 1000) // Convert current time to Unix timestamp
  const expirationTimestamp = timestamp + expiresIn
  return expirationTimestamp - threshold <= currentTimestamp
}

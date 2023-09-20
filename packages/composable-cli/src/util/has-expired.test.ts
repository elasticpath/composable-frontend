import { hasExpiredWithThreshold } from "./has-expired"

describe("hasExpiredWithThreshold", () => {
  // Test case 1: Token has expired
  it("hasExpiredWithThreshold returns true when the token has expired", () => {
    const unixTimestamp = 1695056417
    const expiresIn = 3600
    const threshold = 300
    const result = hasExpiredWithThreshold(unixTimestamp, expiresIn, threshold)
    expect(result).toBe(true)
  })

  // Test case 2: Token is still valid within the threshold
  it("hasExpiredWithThreshold returns false when the token is still valid within the threshold", () => {
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const unixTimestamp = currentTimestamp + 1800 // Expires in 30 minutes
    const expiresIn = 3600
    const threshold = 3600 // 1 hour threshold
    const result = hasExpiredWithThreshold(unixTimestamp, expiresIn, threshold)
    expect(result).toBe(false)
  })

  // Test case 3: Token is still valid and outside the threshold
  it("hasExpiredWithThreshold returns false when the token is still valid and outside the threshold", () => {
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const unixTimestamp = currentTimestamp + 3600 // Expires in 1 hour
    const expiresIn = 7200 // Expires in 2 hours
    const threshold = 1800 // 30 minutes threshold
    const result = hasExpiredWithThreshold(unixTimestamp, expiresIn, threshold)
    expect(result).toBe(false)
  })
})

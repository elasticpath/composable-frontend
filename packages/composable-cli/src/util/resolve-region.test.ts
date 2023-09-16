import { resolveHostFromRegion } from "./resolve-region"

describe("resolve region utilities", () => {
  test("resolveRegion should return https://euwest.api.elasticpath.com when provided eu-west", () => {
    const result = resolveHostFromRegion("eu-west")
    expect(result).toEqual("https://euwest.api.elasticpath.com")
  })
  test("resolveRegion should return useast.api.elasticpath.com when provided us-east host", () => {
    const result = resolveHostFromRegion("us-east")
    expect(result).toEqual("https://useast.api.elasticpath.com")
  })
})

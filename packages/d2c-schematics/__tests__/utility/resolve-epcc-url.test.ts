import { resolveEpccBaseUrl } from "../../utility/resolve-epcc-url"

describe("resolveEpccBaseUrl", () => {
  it("resolveEpccBaseUrl should correct url for eu-west", () => {
    expect(resolveEpccBaseUrl("eu-west")).toEqual(`https://api.moltin.com`)
  })

  it("resolveEpccBaseUrl should correct url for us-east", () => {
    expect(resolveEpccBaseUrl("us-east")).toEqual(
      `https://useast.api.elasticpath.com`
    )
  })
})

export const latestVersions: Record<string, string> = {
  // We could have used TypeScripts' `resolveJsonModule` to make the `latestVersion` object typesafe,
  // but ts_library doesn't support JSON inputs.
  ...require("./latest-versions/package.json")["dependencies"],
}

const reactShopperHooks = require("../../react-shopper-hooks/package.json")
const shopperCommon = require("../../shopper-common/package.json")

export const localLatestVersions: Record<string, string> = {
  [reactShopperHooks.name]: reactShopperHooks.version.toString(),
  [shopperCommon.name]: shopperCommon.version.toString(),
}

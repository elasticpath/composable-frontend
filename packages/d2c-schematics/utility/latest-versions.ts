export const latestVersions: Record<string, string> = {
  // We could have used TypeScripts' `resolveJsonModule` to make the `latestVersion` object typesafe,
  // but ts_library doesn't support JSON inputs.
  ...require("./latest-versions/package.json")["dependencies"],
}

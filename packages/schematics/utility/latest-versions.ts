export const latestVersions: Record<string, string> & {
  Angular: string
  DevkitBuildAngular: string
} = {
  // We could have used TypeScripts' `resolveJsonModule` to make the `latestVersion` object typesafe,
  // but ts_library doesn't support JSON inputs.
  ...require("./latest-versions/package.json")["dependencies"],

  // As Angular CLI works with same minor versions of Angular Framework, a tilde match for the current
  Angular: "^14.0.0-next.0",

  // Since @angular-devkit/build-angular and @schematics/angular are always
  // published together from the same monorepo, and they are both
  // non-experimental, they will always have the same version.
  DevkitBuildAngular: "^" + require("../package.json")["version"],
}
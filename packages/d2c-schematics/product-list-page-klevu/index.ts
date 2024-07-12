import {
  MergeStrategy,
  Rule,
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  strings,
  url,
  noop,
  filter,
} from "@angular-devkit/schematics"
import { Schema as KlevuProductListOptions } from "./schema"
import { addDependency } from "../utility"
import { latestVersions } from "../utility/latest-versions"
import { addEnvVariables } from "../utility/add-env-variable"

export const KLEVU_DEPENDENCIES = [
  "@klevu/core",
  "lodash",
  "@types/lodash",
] as const

export const KLEVU_API_KEY = "NEXT_PUBLIC_KLEVU_API_KEY"
export const KLEVU_SEARCH_URL = "NEXT_PUBLIC_KLEVU_SEARCH_URL"

export default function (options: KlevuProductListOptions): Rule {
  const {
    klevuApiKey = "",
    klevuSearchURL = "",
    skipTests,
  } = options

  const envVars = {
    [KLEVU_API_KEY]: klevuApiKey,
    [KLEVU_SEARCH_URL]: klevuSearchURL,
  }

  return chain([
    addEnvVariables(envVars),
    skipTests ? noop() : addEnvVariables(envVars, "/.env.test"),
    ...KLEVU_DEPENDENCIES.map((name) =>
      addDependency(name, latestVersions[name], {
        type: "dependencies",
        packageJsonPath: options.path
          ? `${options.path}/package.json`
          : "/package.json",
        existing: "skip",
        install: "none",
      }),
    ),
    mergeWith(
      apply(url("./files"), [
        options.skipTests
          ? filter((path) => !path.endsWith(".spec.ts.template"))
          : noop(),
        applyTemplates({
          utils: strings,
          ...options,
        }),
        move(options.path || ""),
      ]),
      MergeStrategy.Overwrite,
    ),
  ])
}

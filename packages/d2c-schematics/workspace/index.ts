import {
  Rule,
  apply,
  applyTemplates,
  mergeWith,
  strings,
  url,
  noop,
  filter
} from "@angular-devkit/schematics"
import { latestVersions } from "../utility/latest-versions"
import { Schema as WorkspaceOptions } from "./schema"

export default function(options: WorkspaceOptions): Rule {
  return mergeWith(
    apply(url("./files"), [
      !options.tests
        ? filter(path => !path.endsWith("playwright.config.ts.template"))
        : noop,
      !options.tests
        ? filter(path => !path.endsWith(".env.test.template"))
        : noop,
      applyTemplates({
        utils: strings,
        ...options,
        dot: ".",
        latestVersions
      })
    ])
  )
}

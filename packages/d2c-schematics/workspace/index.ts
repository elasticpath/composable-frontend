import {
  Rule,
  apply,
  applyTemplates,
  mergeWith,
  strings,
  url,
  noop,
  filter,
} from "@angular-devkit/schematics"
import { latestVersions } from "../utility/latest-versions"
import { Schema as WorkspaceOptions } from "./schema"
import { pathEndsWith } from "../utility/path-ends-with"

export default function (options: WorkspaceOptions): Rule {
  return mergeWith(
    apply(url("./files"), [
      !options.tests
        ? filter(
            (path) =>
              !pathEndsWith(path, [
                "playwright.config.ts.template",
                ".env.test.template",
                "vite.config.ts.template",
              ]),
          )
        : noop,
      applyTemplates({
        utils: strings,
        ...options,
        dot: ".",
        latestVersions,
        packageManager: options.packageManager ?? "npm",
      }),
    ]),
  )
}

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
import { Schema as SimpleProductListOptions } from "./schema"

export default function (options: SimpleProductListOptions): Rule {
  return chain([
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

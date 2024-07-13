import {
  Rule,
  apply,
  chain,
  mergeWith,
  url,
  applyTemplates,
  strings,
  move,
  MergeStrategy,
} from "@angular-devkit/schematics"
import { Schema as AccountOptions } from "./schema"

export default function (options: AccountOptions): Rule {
  return chain([
    mergeWith(
      apply(url("./files"), [
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

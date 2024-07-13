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
  schematic,
} from "@angular-devkit/schematics"
import { Schema as HomeOptions } from "./schema"

export default function (options: HomeOptions): Rule {
  return chain([
    schematic("featured-products", {}),
    schematic("promotion-banner", {}),
    mergeWith(
      apply(url("./files"), [
        applyTemplates({
          utils: strings,
          ...options,
        }),
        move(options.path || ""),
      ]),
      MergeStrategy.Overwrite
    ),
  ])
}

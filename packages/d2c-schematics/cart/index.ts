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
import { Schema as CartOptions } from "./schema"

export default function (options: CartOptions): Rule {
  // The chain rule allows us to chain multiple rules and apply them one after the other.
  return chain([
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

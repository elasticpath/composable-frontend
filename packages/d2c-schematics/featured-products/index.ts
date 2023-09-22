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
import { Schema as FeaturedProductsOptions } from "./schema"

export default function (options: FeaturedProductsOptions): Rule {
  return () => {
    return chain([
      mergeWith(
        apply(url("./files"), [
          applyTemplates({
            utils: {
              ...strings,
            },
            ...options,
          }),
          move(options.path || ""),
        ]),
        MergeStrategy.Overwrite
      ),
    ])
  }
}

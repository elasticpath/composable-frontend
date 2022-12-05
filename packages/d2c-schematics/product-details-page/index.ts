import {
  MergeStrategy,
  Rule,
  Tree,
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  strings,
  url,
  noop,
  filter
} from "@angular-devkit/schematics"
import { Schema as ProductDetailsOptions } from "./schema"

export default function(options: ProductDetailsOptions): Rule {
  return async (_host: Tree) => {
    return chain([
      mergeWith(
        apply(url("./files"), [
          options.skipTests
            ? filter(path => !path.endsWith(".spec.ts.template"))
            : noop(),
          applyTemplates({
            utils: strings,
            ...options
          }),
          move(options.path || "")
        ]),
        MergeStrategy.Overwrite
      )
    ])
  }
}

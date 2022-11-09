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
  SchematicContext
} from "@angular-devkit/schematics"
import { Schema as ProductDetailsOptions } from "./schema"

export default function(options: ProductDetailsOptions): Rule {
  return async (_host: Tree) => {
    return chain([
      (_tree: Tree, context: SchematicContext) => {
        // Show the options for this Schematics.
        context.logger.info(
          `Product Details Schematic running: ${JSON.stringify(options)}`
        )
      },
      mergeWith(
        apply(url("./files"), [
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

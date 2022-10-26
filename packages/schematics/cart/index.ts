import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  chain,
  mergeWith,
  url,
  applyTemplates,
  strings,
  move,
  MergeStrategy
} from "@angular-devkit/schematics"
import { Schema as CartOptions } from "./schema"

export default function(options: CartOptions): Rule {
  // The chain rule allows us to chain multiple rules and apply them one after the other.
  return chain([
    (_tree: Tree, context: SchematicContext) => {
      // Show the options for this Schematics.
      context.logger.info("Cart Schematic running.")
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

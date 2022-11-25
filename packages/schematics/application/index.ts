import { normalize } from "@angular-devkit/core"
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
} from "@angular-devkit/schematics"
import { Schema as ApplicationOptions } from "./schema"

export default function (options: ApplicationOptions): Rule {
  return async (_host: Tree) => {
    const appDir = normalize(options.projectRoot || "")

    return chain([
      mergeWith(
        apply(url("./files"), [
          applyTemplates({
            utils: strings,
            ...options,
          }),
          move(appDir),
        ]),
        MergeStrategy.Overwrite
      ),
    ])
  }
}

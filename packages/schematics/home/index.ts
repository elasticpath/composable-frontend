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
  const { components = [] } = options

  const componentSchematicNames = components.map((x) => {
    return strings.dasherize(x.toString())
  })

  const componentCreators = componentSchematicNames.map((name) =>
    // TODO need to work out how I'm going to pass the options for each scheamtic for the test because we can't prompt
    //  emulate it in the test?
    schematic(name, {})
  )

  return chain([
    ...componentCreators,
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

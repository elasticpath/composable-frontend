import {
  Arguments,
  Argv,
  Options as YargsOptions,
  PositionalOptions,
} from "yargs"
import { Option } from "./json-schema"
import { strings } from "@angular-devkit/core"

export function addSchemaOptionsToCommand<T>(
  localYargs: Argv<T>,
  options: Option[]
): Argv<T> {
  const booleanOptionsWithNoPrefix = new Set<string>()

  for (const option of options) {
    const {
      default: defaultVal,
      positional,
      deprecated,
      description,
      alias,
      type,
      hidden,
      name,
      choices,
    } = option

    const sharedOptions: YargsOptions & PositionalOptions = {
      alias,
      hidden,
      description,
      deprecated,
      choices,
      default: defaultVal,
    }

    let dashedName = strings.dasherize(name)

    // Handle options which have been defined in the schema with `no` prefix.
    if (type === "boolean" && dashedName.startsWith("no-")) {
      dashedName = dashedName.slice(3)
      booleanOptionsWithNoPrefix.add(dashedName)
    }

    if (positional === undefined) {
      localYargs = localYargs.option(dashedName, {
        type,
        ...sharedOptions,
      })
    } else {
      localYargs = localYargs.positional(dashedName, {
        type: type === "array" || type === "count" ? "string" : type,
        ...sharedOptions,
      })
    }
  }

  // Handle options which have been defined in the schema with `no` prefix.
  if (booleanOptionsWithNoPrefix.size) {
    localYargs.middleware((options: Arguments) => {
      for (const key of booleanOptionsWithNoPrefix) {
        if (key in options) {
          options[`no-${key}`] = !options[key]
          delete options[key]
        }
      }
    }, false)
  }

  return localYargs
}

#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// symbol polyfill must go first
import "symbol-observable"
import { ProcessOutput } from "@angular-devkit/core/node"
import yargs from "yargs/yargs"
import {
  createAuthenticationMiddleware,
  createLoginCommand,
} from "./commands/login/login-command"
import { createConfigCommand } from "./commands/config"
import { createStoreCommand } from "./commands/store"
import {
  createGenerateBuilder,
  createGenerateCommand,
} from "./commands/generate"
import { createCommandContext } from "./util/command"

export interface MainOptions {
  args: string[]
  stdout?: ProcessOutput
  stderr?: ProcessOutput
}

const commandContext = createCommandContext()

// eslint-disable-next-line max-lines-per-function
export async function main({
  args,
  stdout = process.stdout,
  stderr = process.stderr,
}: MainOptions): Promise<1 | 0> {
  await yargs(args)
    .command(createLoginCommand(commandContext))
    .command({
      command: "config [subcommand]",
      describe: "interact with stored configuration",
      builder: (yargs) => {
        return yargs
          .middleware(createAuthenticationMiddleware(commandContext))
          .positional("subcommand", {
            choices: [`list`, `clear`] as const,
            describe: "subcommand to run for config",
            type: "string",
          })
      },
      handler: createConfigCommand(commandContext.store) as any,
    })
    .command({
      command: "store [subcommand]",
      describe: "interact with Elasticpath store",
      builder: (yargs) => {
        return yargs.positional("subcommand", {
          choices: [`set`] as const,
          describe: "subcommand to run for store",
          type: "string",
        })
      },
      handler: createStoreCommand(commandContext.store) as any,
    })
    .command({
      command: "generate <schematic>",
      aliases: ["g"],
      describe: "generate Elasticpath storefront",
      builder: createGenerateBuilder,
      handler: createGenerateCommand(
        commandContext.store,
        stdout,
        stderr
      ) as any,
    })
    .option("verbose", {
      alias: "v",
      type: "boolean",
      description: "Run with verbose logging",
    })
    .strictCommands()
    .demandCommand(1)
    .parse()

  return 0
}

if (require.main === module) {
  const args = process.argv.slice(2)
  main({ args })
    .then((exitCode) => (process.exitCode = exitCode))
    .catch((e) => {
      throw e
    })
}

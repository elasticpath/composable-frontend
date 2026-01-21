import util from "util"
import child_process from "child_process"
import path from "path"

const exec = util.promisify(child_process.exec)

/**
 * TODO:
 *  - Get top level help commands from help output
 *    - alias are not being handled correctly
 *  - Get sub commands using a recursive lookup on each command
 *  - build markdown output from commands
 */

const getCommands = async (
  cliName: string,
  cliExe: string,
  helpOutput: string,
  depth = 1,
  previousCommand = "",
) => {
  const commandSection = helpOutput
    .split("\n\n")
    .find((section) => section.startsWith("Commands:"))

  const commands = commandSection
    ? commandSection
        .split("\n")
        .slice(1)
        .filter((commandString) => commandString.trim().startsWith(cliName))
        .map((commandString) => {
          const command = commandString
            .trim()
            .replace(`${cliName} ${previousCommand}`, "")
            .trim()
            .split(" ")[0]

          return previousCommand ? `${previousCommand} ${command}` : command
        })
    : []

  console.log("top level commands: ", commands)

  return await Promise.all(
    commands.map(
      (command) =>
        new Promise(async (resolve, reject) => {
          try {
            const { stdout, stderr } = await exec(`${cliExe} ${command} --help`)

            if (stderr) {
              reject(stderr)

              return
            }

            console.log("calling for nested commands: ", command)
            const nestedCommands = await getCommands(
              cliName,
              cliExe,
              stdout,
              depth + 1,
              command,
            )

            resolve([
              { name: command, depth, helpOutput: stdout },
              nestedCommands,
            ])
          } catch (err) {
            console.log("err", err)
            reject(err)
          }
        }),
    ),
  )
}

async function main() {
  const relativeCliExe = "../packages/composable-cli/dist/bin/composable.js"
  const resolvedCliExe = path.resolve(path.dirname(__filename), relativeCliExe)

  console.log("pwd", resolvedCliExe)
  const { stdout: helpOutput, stderr } = await exec(`${resolvedCliExe} --help`)

  console.log("helpOutput", helpOutput)

  const result = await getCommands("composable.js", resolvedCliExe, helpOutput)

  console.log("result: ", result)
}

main()

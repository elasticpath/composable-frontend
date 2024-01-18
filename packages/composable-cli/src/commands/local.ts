import { isTruthy } from "../util/is-truthy"
import { exec } from "./system"
import isInteractive from "is-interactive"

/**
 * This variable is used when running unit tests to indicate that the CLI's business logic
 * is run as a subject of a unit test. We can use this variable to disable output through
 * the standard streams.
 *
 * @param env - The environment variables from the environment of the current process.
 * @returns True if the UNIT_TEST environment variable is truthy.
 */
export function isUnitTest(env = process.env): boolean {
  return isTruthy(env["UNIT_TEST"])
}

/**
 * Returns true if the CLI is running in verbose mode.
 *
 * @param env - The environment variables from the environment of the current process.
 * @returns True if FLAG_VERBOSE is truthy or the flag --verbose has been passed.
 */
export function isVerbose(env = process.env): boolean {
  return isTruthy(env["FLAG_VERBOSE"]) || process.argv.includes("--verbose")
}

/**
 * Returns whether the environment has Git available.
 *
 * @returns A promise that resolves with the value.
 */
export async function hasGit(): Promise<boolean> {
  try {
    await exec("git", ["--version"])
    return true
    // eslint-disable-next-line no-catch-all/no-catch-all
  } catch {
    return false
  }
}

/**
 * It returns true if the terminal is interactive.
 *
 * @returns True if the terminal is interactive.
 */
export function isTerminalInteractive(): boolean {
  return isInteractive()
}

import { appendFileSync as fsAppendFileSync } from "fs"

/**
 * Synchronously appends content to file at path.
 *
 * @param path - Path to the file to be appended.
 * @param data - Content to be appended.
 */
export function appendFileSync(path: string, data: string): void {
  fsAppendFileSync(path, data)
}

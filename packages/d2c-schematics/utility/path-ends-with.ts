import { Path } from "@angular-devkit/core"

export function pathEndsWith(path: Path, ends: string | string[]): boolean {
  if (typeof ends === "string") {
    return path.endsWith(ends)
  }
  return ends.some((end) => path.endsWith(end))
}

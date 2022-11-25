import { Path } from "@angular-devkit/core"
import minimatch from "minimatch"

export function matchAll(path: Path, matchers: string[]): boolean {
  return !!matchers.find((matcher) => minimatch(path, matcher))
}

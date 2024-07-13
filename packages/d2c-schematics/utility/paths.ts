import { normalize, split } from "@angular-devkit/core"

export function relativePathToWorkspaceRoot(
  projectRoot: string | undefined
): string {
  const normalizedPath = split(normalize(projectRoot || ""))

  if (normalizedPath.length === 0 || !normalizedPath[0]) {
    return "."
  } else {
    return normalizedPath.map(() => "..").join("/")
  }
}

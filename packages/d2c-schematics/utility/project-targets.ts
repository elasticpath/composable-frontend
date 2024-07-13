import { SchematicsException } from "@angular-devkit/schematics"

export function targetBuildNotFoundError(): SchematicsException {
  return new SchematicsException(`Project target "build" not found.`)
}

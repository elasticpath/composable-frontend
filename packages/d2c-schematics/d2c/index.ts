import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  chain,
  empty,
  mergeWith,
  move,
  schematic,
} from "@angular-devkit/schematics"
import {
  NodePackageInstallTask,
  RepositoryInitializerTask,
} from "@angular-devkit/schematics/tasks"
import { Schema as ApplicationOptions } from "../application/schema"
import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ProductListOptions } from "../product-list-page/schema"
import { Schema as D2COptions } from "./schema"

export default function (options: D2COptions): Rule {
  if (!options.directory) {
    // If scoped project (i.e. "@foo/bar"), convert directory to "foo/bar".
    options.directory = options.name.startsWith("@")
      ? options.name.slice(1)
      : options.name
  }

  const projectRoot = ""

  const {
    epccEndpointUrl,
    epccClientSecret,
    epccClientId,
    plpType,
    skipTests,
    name,
  } = options

  const workspaceOptions: WorkspaceOptions = {
    name,
    epccClientId,
    epccClientSecret,
    epccEndpointUrl,
  }

  const applicationOptions: ApplicationOptions = {
    projectRoot,
    name,
    skipTests,
  }

  const plpOptions: ProductListOptions = {
    ...options,
    path: projectRoot,
    skipTests,
    epccClientId,
    epccClientSecret,
    epccEndpointUrl,
    plpType,
    directory: options.directory,
  }

  return chain([
    mergeWith(
      apply(empty(), [
        schematic("workspace", workspaceOptions),
        schematic("application", applicationOptions),
        schematic("cart", {
          path: projectRoot,
        }),
        schematic("header", {
          path: projectRoot,
          search: false,
        }),
        schematic("footer", {
          path: projectRoot,
        }),
        schematic("pdp", {
          path: projectRoot,
        }),
        schematic("plp", plpOptions),
        schematic("home", {
          path: projectRoot,
        }),
        move(options.directory),
      ])
    ),
    (_host: Tree, context: SchematicContext) => {
      let packageTask
      if (!options.skipGit) {
        const commit =
          typeof options.commit == "object"
            ? options.commit
            : options.commit
            ? {}
            : false

        packageTask = context.addTask(
          new RepositoryInitializerTask(options.directory, commit)
        )
      }
      if (!options.skipInstall) {
        context.addTask(
          new NodePackageInstallTask({
            workingDirectory: options.directory,
            packageManager: "yarn",
          }),
          packageTask ? [packageTask] : []
        )
      }
    },
  ])
}

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
import { Schema as EPNewOptions } from "./schema"

export default function (options: EPNewOptions): Rule {
  if (!options.directory) {
    // If scoped project (i.e. "@foo/bar"), convert directory to "foo/bar".
    options.directory = options.name.startsWith("@")
      ? options.name.slice(1)
      : options.name
  }

  const projectRoot = ""

  const { epccEndpointUrl, epccClientSecret, epccClientId } = options

  const workspaceOptions: WorkspaceOptions = {
    name: options.name,
    epccClientId,
    epccClientSecret,
    epccEndpointUrl,
  }

  const applicationOptions: ApplicationOptions = {
    projectRoot,
    name: options.name,
    skipTests: options.skipTests,
  }

  const plpOptions: ProductListOptions = {
    path: projectRoot,
    skipTests: options.skipTests,
    epccClientId,
    epccClientSecret,
    epccEndpointUrl,
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

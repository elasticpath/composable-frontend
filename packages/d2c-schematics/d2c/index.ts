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
import { RepositoryInitializerTask } from "@angular-devkit/schematics/tasks"
import { Schema as ApplicationOptions } from "../application/schema"
import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ProductListOptions } from "../product-list-page/schema"
import { Schema as CheckoutOptions } from "../checkout/schema"
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
    packageManager,
  } = options
  const workspaceOptions: WorkspaceOptions = {
    name,
    epccClientId,
    epccClientSecret,
    epccEndpointUrl,
    packageManager,
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

  const checkoutOptions: CheckoutOptions = {
    ...options,
    path: projectRoot,
    skipTests,
    epccClientId,
    epccClientSecret,
    epccEndpointUrl,
    paymentGatewayType: options.paymentGatewayType,
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
          search: plpType === "Algolia",
        }),
        schematic("footer", {
          path: projectRoot,
        }),
        schematic("pdp", {
          path: projectRoot,
        }),
        schematic("plp", plpOptions),
        schematic("checkout", checkoutOptions),
        schematic("home", {
          path: projectRoot,
        }),
        schematic("account", {
          path: projectRoot,
        }),
        move(options.directory),
      ]),
    ),
  ])
}

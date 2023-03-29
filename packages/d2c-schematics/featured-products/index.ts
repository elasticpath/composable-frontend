import {
  Rule,
  apply,
  chain,
  mergeWith,
  url,
  applyTemplates,
  strings,
  move,
  MergeStrategy,
} from "@angular-devkit/schematics"
import { Schema as FeaturedProductsOptions } from "./schema"
import { addEnvVariables } from "../utility/add-env-variable"

export type EnvData = Record<string, string>

export const FEATURED_PRODUCTS_ENV_KEY = "NEXT_PUBLIC_DEMO_NODE_ID"

export default function (options: FeaturedProductsOptions): Rule {
  return () => {
    const { "featured-node-id": nodeId } = options
    return chain([
      addEnvVariables({ [FEATURED_PRODUCTS_ENV_KEY]: nodeId }),
      mergeWith(
        apply(url("./files"), [
          applyTemplates({
            utils: {
              ...strings,
            },
            ...options,
          }),
          move(options.path || ""),
        ]),
        MergeStrategy.Overwrite
      ),
    ])
  }
}

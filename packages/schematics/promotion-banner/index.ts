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
import { Schema as PromotionsBannerOptions } from "./schema"
import { addEnvVariable } from "../utility/add-env-variable"

export type EnvData = Record<string, string>

export const PROMO_ENV_KEY = "NEXT_PUBLIC_DEMO_PROMO_ID"

export default function (options: PromotionsBannerOptions): Rule {
  return () => {
    const { "promotion-id": promotionId } = options
    return chain([
      addEnvVariable(PROMO_ENV_KEY, promotionId),
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

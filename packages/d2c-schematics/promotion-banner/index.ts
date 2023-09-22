import {
  apply,
  applyTemplates,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  strings,
  url,
} from "@angular-devkit/schematics"
import { Schema as PromotionsBannerOptions } from "./schema"

export default function (options: PromotionsBannerOptions): Rule {
  return () => {
    return chain([
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

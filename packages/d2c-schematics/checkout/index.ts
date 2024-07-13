import {
  apply,
  applyTemplates,
  chain,
  filter,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  schematic,
  strings,
  Tree,
  url,
} from "@angular-devkit/schematics"
import type { Schema as CheckoutOptions } from "./schema"

export default function (options: CheckoutOptions): Rule {
  const { paymentGatewayType } = options

  const paymentGatewaySchematic = resolveGatewaySchematic(paymentGatewayType)

  return async (_host: Tree) => {
    return chain([
      paymentGatewaySchematic === "none"
        ? noop()
        : schematic(paymentGatewaySchematic, { ...options }),
      paymentGatewaySchematic === "none"
        ? noop()
        : mergeWith(
            apply(url("./files"), [
              options.skipTests
                ? filter((path) => !path.endsWith(".spec.ts.template"))
                : noop(),
              applyTemplates({
                utils: strings,
                ...options,
              }),
              move(options.path || ""),
            ]),
            MergeStrategy.Overwrite,
          ),
    ])
  }
}

function resolveGatewaySchematic(
  gateway: CheckoutOptions["paymentGatewayType"],
): string {
  switch (gateway) {
    case "EP Payments":
      return "ep-payments-payment-gateway"
    case "Manual":
      return "manual-payment-gateway"
    case "None":
      return "none"
    default:
      return "none"
  }
}

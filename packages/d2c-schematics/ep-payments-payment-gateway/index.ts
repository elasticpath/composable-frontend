import {
  MergeStrategy,
  Rule,
  Tree,
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  strings,
  url,
  noop,
  filter,
} from "@angular-devkit/schematics"
import { Schema as EPPaymentsPaymentGatewayOptions } from "./schema"
import { addDependency } from "../utility"
import { latestVersions } from "../utility/latest-versions"
import { addEnvVariables } from "../utility/add-env-variable"

export const EP_PAYMENTS_DEPENDENCIES = [
  "@stripe/react-stripe-js",
  "@stripe/stripe-js",
] as const

export const EP_PAYMENT_STRIPE_ACCOUNT_ID = "NEXT_PUBLIC_STRIPE_ACCOUNT_ID"
export const EP_PAYMENT_STRIPE_PUBLISHABLE_KEY =
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"

export default function (options: EPPaymentsPaymentGatewayOptions): Rule {
  const {
    epPaymentsStripeAccountId = "",
    epPaymentsStripePublishableKey = "",
    skipTests,
  } = options

  return async (_host: Tree) => {
    return chain([
      addEnvVariables({
        [EP_PAYMENT_STRIPE_ACCOUNT_ID]: epPaymentsStripeAccountId,
        [EP_PAYMENT_STRIPE_PUBLISHABLE_KEY]: epPaymentsStripePublishableKey,
      }),
      skipTests
        ? noop()
        : addEnvVariables(
            {
              [EP_PAYMENT_STRIPE_ACCOUNT_ID]: epPaymentsStripeAccountId,
              [EP_PAYMENT_STRIPE_PUBLISHABLE_KEY]:
                epPaymentsStripePublishableKey,
            },
            "/.env.test",
          ),
      ...EP_PAYMENTS_DEPENDENCIES.map((name) =>
        addDependency(name, latestVersions[name], {
          type: "dependencies",
          packageJsonPath: options.path
            ? `${options.path}/package.json`
            : "/package.json",
          existing: "skip",
          install: "none",
        }),
      ),
      mergeWith(
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

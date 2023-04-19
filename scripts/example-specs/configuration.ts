import type { Schema as AppSchema } from "../../dist-schema/packages/d2c-schematics/application/schema"
import type { Schema as D2CSchema } from "../../dist-schema/packages/d2c-schematics/d2c/schema"
import type { PlpType } from "../../dist-schema/packages/d2c-schematics/d2c/schema"
import type { Schema as EPPaymentsSchema } from "../../dist-schema/packages/d2c-schematics/ep-payments-payment-gateway/schema"
import type {
  PaymentGatewayType,
  Schema as CheckoutSchema,
} from "../../dist-schema/packages/d2c-schematics/checkout/schema"
import type { Schema as PLPSchema } from "../../dist-schema/packages/d2c-schematics/product-list-page/schema"
import type { Schema as PLPAlgoliaSchema } from "../../dist-schema/packages/d2c-schematics/product-list-page-algolia/schema"

interface CLIArgs {
  dryRun: boolean
  interactive: boolean
}

type BasicSpec = AppSchema &
  D2CSchema &
  EPPaymentsSchema &
  CheckoutSchema &
  CLIArgs

type AlgoliaSpec = AppSchema &
  D2CSchema &
  CLIArgs &
  PLPSchema &
  PLPAlgoliaSchema

type Spec<TArgs extends Record<string, string>> = {
  name: string
  args: TArgs
}

interface Configuration<TArgs extends Record<string, string>> {
  specs: Spec<TArgs>[]
}

type ConfigurationSpec = Omit<BasicSpec | AlgoliaSpec, "directory">

export const configuration: Configuration<ConfigurationSpec> = {
  specs: [
    {
      name: "basic",
      args: {
        epccClientId: "abc123",
        epccClientSecret: "abc456",
        epccEndpointUrl: "abc789",
        skipGit: true,
        skipInstall: true,
        skipConfig: true,
        plpType: "None" as PlpType.None,
        epPaymentsStripeAccountId: "abc123",
        epPaymentsStripePublishableKey: "abc456",
        name: "basic",
        dryRun: false,
        interactive: false,
        paymentGatewayType: "EP Payments" as PaymentGatewayType.EpPayments,
      },
    },
    {
      name: "algolia",
      args: {
        epccClientId: "abc123",
        epccClientSecret: "abc456",
        epccEndpointUrl: "abc789",
        skipGit: true,
        skipInstall: true,
        skipConfig: true,
        name: "algolia",
        dryRun: false,
        interactive: false,
        plpType: "Algolia" as PlpType.Algolia,
      },
    },
  ],
}

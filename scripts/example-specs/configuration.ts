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

type ConfigurationSpecHelper<TSpec extends Record<string, string>> = Omit<
  TSpec,
  "directory"
>

type BasicSpec = ConfigurationSpecHelper<
  AppSchema & D2CSchema & EPPaymentsSchema & CheckoutSchema & CLIArgs
>

type AlgoliaSpec = ConfigurationSpecHelper<
  AppSchema & D2CSchema & CLIArgs & PLPSchema & PLPAlgoliaSchema
>

type Spec<TArgs extends Record<string, string>> = {
  name: string
  args: TArgs
}

interface Configuration<TArgs extends Record<string, string>> {
  specs: Spec<TArgs>[]
}

export const configuration: Configuration<AlgoliaSpec | BasicSpec> = {
  specs: [
    {
      name: "basic",
      args: {
        epccClientId: process.env.EPCC_CLIENT_ID,
        epccClientSecret: process.env.EPCC_CLIENT_SECRET,
        epccEndpointUrl: process.env.EPCC_ENDPOINT,
        skipGit: true,
        skipInstall: true,
        skipConfig: true,
        plpType: "None" as PlpType.None,
        epPaymentsStripeAccountId: process.env.EP_PAYMENTS_STRIPE_ACCOUNT_ID,
        epPaymentsStripePublishableKey:
          process.env.EP_PAYMENTS_STRIPE_PUBLISHABLE_KEY,
        name: "basic",
        dryRun: false,
        interactive: false,
        paymentGatewayType: "EP Payments" as PaymentGatewayType.EpPayments,
        packageManager: "pnpm",
      },
    },
    {
      name: "algolia",
      args: {
        epccClientId: process.env.EPCC_CLIENT_ID,
        epccClientSecret: process.env.EPCC_CLIENT_SECRET,
        epccEndpointUrl: process.env.EPCC_ENDPOINT,
        skipGit: true,
        skipInstall: true,
        skipConfig: true,
        name: "algolia",
        dryRun: false,
        interactive: false,
        plpType: "Algolia" as PlpType.Algolia,
        algoliaAdminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
        algoliaApplicationId: process.env.ALGOLIA_APP_ID,
        algoliaSearchOnlyApiKey: process.env.ALGOLIA_SEARCH_ONLY_API_KEY,
        algoliaIndexName: process.env.ALGOLIA_INDEX_NAME,
        packageManager: "pnpm",
      },
    },
  ],
}

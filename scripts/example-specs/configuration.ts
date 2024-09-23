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
import type { Schema as KlevuAlgoliaSchema } from "../../dist-schema/packages/d2c-schematics/product-list-page-klevu/schema"

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

type KlevuSpec = ConfigurationSpecHelper<
  AppSchema & D2CSchema & CLIArgs & PLPSchema & KlevuAlgoliaSchema
>

type Spec<TArgs extends Record<string, string>> = {
  name: string
  args: TArgs
}

interface Configuration<TArgs extends Record<string, string>> {
  specs: Spec<TArgs>[]
}

export const configuration: Configuration<AlgoliaSpec | BasicSpec | KlevuSpec> = {
  specs: [
    {
      name: "simple",
      args: {
        epccClientId: process.env.EPCC_CLIENT_ID,
        epccClientSecret: process.env.EPCC_CLIENT_SECRET,
        epccEndpointUrl: process.env.EPCC_ENDPOINT,
        skipGit: true,
        skipInstall: true,
        skipConfig: true,
        plpType: "Simple" as PlpType.Simple,
        name: "simple",
        dryRun: false,
        interactive: false,
        paymentGatewayType: "Manual" as PaymentGatewayType.Manual,
        packageManager: "pnpm",
      },
    },
    {
      name: "payments",
      args: {
        epccClientId: process.env.EPCC_CLIENT_ID,
        epccClientSecret: process.env.EPCC_CLIENT_SECRET,
        epccEndpointUrl: process.env.EPCC_ENDPOINT,
        skipGit: true,
        skipInstall: true,
        skipConfig: true,
        plpType: "Simple" as PlpType.Simple,
        epPaymentsStripeAccountId: process.env.EP_PAYMENTS_STRIPE_ACCOUNT_ID,
        epPaymentsStripePublishableKey:
          process.env.EP_PAYMENTS_STRIPE_PUBLISHABLE_KEY,
        name: "payments",
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
        paymentGatewayType: "Manual" as PaymentGatewayType.Manual,
        algoliaIndexName: process.env.ALGOLIA_INDEX_NAME,
        packageManager: "pnpm",
      },
    },
    {
      name: "Klevu",
      args: {
        epccClientId: process.env.EPCC_CLIENT_ID,
        epccClientSecret: process.env.EPCC_CLIENT_SECRET,
        epccEndpointUrl: process.env.EPCC_ENDPOINT,
        skipGit: true,
        skipInstall: true,
        skipConfig: true,
        name: "klevu",
        dryRun: false,
        interactive: false,
        plpType: "Klevu" as PlpType.Klevu,
        klevuApiKey: process.env.KLEVU_API_KEY,
        klevuSearchUrl: process.env.KLEVU_SEARCH_URL,
        paymentGatewayType: "Manual" as PaymentGatewayType.Manual,
        packageManager: "pnpm",
      },
    },    
    {
      name: "global-services",
      args: {
        epccClientId: process.env.EPCC_CLIENT_ID,
        epccClientSecret: process.env.EPCC_CLIENT_SECRET,
        epccEndpointUrl: process.env.EPCC_ENDPOINT,
        skipGit: true,
        skipInstall: true,
        skipConfig: true,
        name: "global-services",
        dryRun: false,
        interactive: false,
        plpType: "Klevu" as PlpType.Klevu,
        klevuApiKey: process.env.KLEVU_API_KEY,
        klevuSearchUrl: process.env.KLEVU_SEARCH_URL,
        paymentGatewayType: "Manual" as PaymentGatewayType.Manual,
        packageManager: "pnpm",
      },
    },
  ],
}

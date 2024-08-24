export type GatheredOptions = {
  epccClientId?: string
  epccClientSecret?: string
  location?: string | null
  name?: string
  directory?: string
  epccEndpointUrl?: string
  plpType?: "Algolia" | "Simple" | "Klevu"
  algoliaApplicationId?: string
  algoliaAdminApiKey?: string
  klevuApiKey?: string
  klevuSearchURL?: string
  klevuRestAuthKey?: string
  paymentGatewayType?: PaymentTypeOptions["paymentGatewayType"]
  epPaymentsStripeAccountId?: string
  epPaymentsStripePublishableKey?: string
}

export type PaymentTypeOptions =
  | {
      paymentGatewayType: "EP Payments"
      epPaymentsStripeAccountId: string
      epPaymentsStripePublishableKey: string
    }
  | { paymentGatewayType: "Manual" }

export type PlpTypeOptions =
  | {
      plpType: "Algolia"
      algoliaApplicationId: string
      algoliaAdminApiKey: string
      algoliaSearchOnlyApiKey: string
    }
  | {
      plpType: "Klevu"
      klevuApiKey: string
      klevuSearchURL: string
      klevuRestAuthKey: string
    }
  | { plpType: "Simple" }

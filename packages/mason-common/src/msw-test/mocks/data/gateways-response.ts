export const gatewaysEnabledResponse = {
  data: [
    {
      enabled: false,
      name: "PayPal Express Checkout",
      payer_id: "test",
      slug: "paypal_express_checkout",
      test: true,
      type: "gateway",
    },
    {
      enabled: false,
      merchant_id: "",
      name: "CardConnect",
      password: "",
      slug: "card_connect",
      test: false,
      type: "gateway",
      username: "",
    },
    {
      enabled: false,
      login: "",
      name: "Stripe",
      slug: "stripe",
      type: "gateway",
    },
    {
      enabled: false,
      login: "",
      name: "Stripe Payment Intents",
      slug: "stripe_payment_intents",
      type: "gateway",
    },
    {
      enabled: false,
      login: "",
      name: "PayPal Payflow Pro Express Checkout",
      partner: "",
      password: "",
      slug: "payflow_express",
      test: false,
      type: "gateway",
    },
    {
      enabled: false,
      environment: "sandbox",
      merchant_id: "c7vsygnbwqhy7wxx",
      name: "Braintree",
      private_key: "",
      public_key: "",
      slug: "braintree",
      type: "gateway",
    },
    {
      enabled: false,
      login: "",
      name: "CyberSource",
      password: "",
      slug: "cyber_source",
      test: false,
      type: "gateway",
    },
    {
      enabled: false,
      login: "",
      name: "PayPal Express Checkout",
      password: "",
      signature: "",
      slug: "paypal_express",
      test: false,
      type: "gateway",
    },
    {
      enabled: false,
      merchant_account: "",
      name: "Adyen",
      password: "",
      slug: "adyen",
      test: false,
      type: "gateway",
      username: "",
    },
    {
      enabled: false,
      login: "",
      name: "Authorize.net",
      password: "",
      slug: "authorize_net",
      test: false,
      type: "gateway",
    },
    {
      enabled: false,
      name: "Elastic Path Payments powered by Stripe",
      slug: "elastic_path_payments_stripe",
      stripe_account: "",
      test: false,
      type: "gateway",
    },
    {
      enabled: true,
      name: "Manual",
      slug: "manual",
      type: "gateway",
    },
    {
      enabled: false,
      name: "Stripe Connect",
      slug: "stripe_connect",
      stripe_account: "",
      test: false,
      type: "gateway",
    },
  ],
}

export const updateEPPaymentGatewayResponse = {
  data: {
    enabled: true,
    name: "Elastic Path Payments powered by Stripe",
    slug: "elastic_path_payments_stripe",
    stripe_account: "XXX-XXX-XXX",
    test: true,
    type: "gateway",
  },
}

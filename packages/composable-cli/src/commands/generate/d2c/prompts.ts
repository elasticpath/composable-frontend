import * as inquirer from "inquirer"
import { PaymentTypeOptions, PlpTypeOptions } from "../utils/types"

export async function klevuSchematicPrompts(): Promise<PlpTypeOptions> {
  const { klevuApiKey } = await inquirer.prompt([
    {
      type: "string",
      name: "klevuApiKey",
      message: "What is your Klevu API Key?",
    },
  ])

  const { klevuSearchURL } = await inquirer.prompt([
    {
      type: "string",
      name: "klevuSearchURL",
      message: "What is your Klevu Search URL?",
    },
  ])

  const { klevuRestAuthKey } = await inquirer.prompt([
    {
      type: "password",
      mask: "*",
      name: "klevuRestAuthKey",
      message: "What is your Klevu rest auth key?",
    },
  ])

  return {
    plpType: "Klevu",
    klevuApiKey,
    klevuSearchURL,
    klevuRestAuthKey,
  }
}

export async function schematicOptionPrompts(): Promise<{
  plp: PlpTypeOptions
  paymentGateway: PaymentTypeOptions
}> {
  const { plpType } = await inquirer.prompt([
    {
      type: "list",
      name: "plpType",
      message: "What type of PLP do you want to create?",
      choices: [
        {
          name: "Simple",
          value: "Simple",
        },
        {
          name: "Algolia",
          value: "Algolia",
        },
        {
          name: "Klevu",
          value: "Klevu",
        },
      ],
    },
  ])

  let plp: PlpTypeOptions
  switch (plpType) {
    case "Algolia":
      plp = await algoliaSchematicPrompts()
      break
    case "Klevu":
      plp = await klevuSchematicPrompts()
      break
    case "Simple":
    default:
      plp = { plpType: "Simple" as const }
  }

  const { paymentGatewayType } = await inquirer.prompt([
    {
      type: "list",
      name: "paymentGatewayType",
      message: "What type of payment gateway do you want to use?",
      choices: [
        {
          name: "Simple (quick start)",
          value: "Manual",
        },
        {
          name: "EP Payments (powered by Stripe)",
          value: "EP Payments",
        },
      ],
    },
  ])

  const paymentGateway =
    paymentGatewayType === "EP Payments"
      ? await epPaymentsSchematicPrompts()
      : { paymentGatewayType: "Manual" as const }

  return {
    plp,
    paymentGateway,
  }
}

export async function epPaymentsSchematicPrompts(): Promise<PaymentTypeOptions> {
  const { epPaymentsStripeAccountId } = await inquirer.prompt([
    {
      type: "string",
      name: "epPaymentsStripeAccountId",
      message: "What is your Elastic Path Payments Account ID?",
    },
  ])

  const { epPaymentsStripePublishableKey } = await inquirer.prompt([
    {
      type: "string",
      name: "epPaymentsStripePublishableKey",
      message: "What is your Elastic Path Payments Publishable Key?",
    },
  ])

  return {
    paymentGatewayType: "EP Payments",
    epPaymentsStripeAccountId,
    epPaymentsStripePublishableKey,
  }
}

export async function algoliaSchematicPrompts(): Promise<PlpTypeOptions> {
  const { algoliaApplicationId } = await inquirer.prompt([
    {
      type: "string",
      name: "algoliaApplicationId",
      message: "What is your Algolia App ID?",
    },
  ])

  const { algoliaSearchOnlyApiKey } = await inquirer.prompt([
    {
      type: "string",
      name: "algoliaSearchOnlyApiKey",
      message: "What is your Algolia Search Only API Key?",
    },
  ])

  const { algoliaAdminApiKey } = await inquirer.prompt([
    {
      type: "password",
      name: "algoliaAdminApiKey",
      message: "What is your Algolia Admin API Key?",
      mask: "*",
    },
  ])

  return {
    plpType: "Algolia",
    algoliaApplicationId,
    algoliaAdminApiKey,
    algoliaSearchOnlyApiKey,
  }
}

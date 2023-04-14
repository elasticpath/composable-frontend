export const epPaymentsEnvData = epPaymentsEnv();

function epPaymentsEnv() {
  return {
    publishableKey: retrieveStripePublishableKey(),
    accountId: retrieveStripeAccountId(),
  };
}

function retrieveStripePublishableKey(): string {
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!stripePublishableKey) {
    throw new Error(
      `Failed to get stripe instance with stripePublishableKey: ${stripePublishableKey}\n Make sure you have set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
    );
  }
  return stripePublishableKey;
}

function retrieveStripeAccountId(): string {
  const stripeAccountId = process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID;
  if (!stripeAccountId) {
    throw new Error(
      `Failed to get stripe instance with stripeAccountId: ${stripeAccountId}\n Make sure you have set NEXT_PUBLIC_STRIPE_ACCOUNT_ID`
    );
  }
  return stripeAccountId;
}

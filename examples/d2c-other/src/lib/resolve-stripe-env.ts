export const stripeEnv = resolveStripeKeyEnv();

export function resolveStripeKeyEnv(): string {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY;

  if (!stripeKey) {
    throw new Error(
      `Failed to get stripe key environment variable stripe key: ${stripeKey}\n Make sure you have set NEXT_PUBLIC_EPCC_CLIENT_ID`
    );
  }

  return stripeKey;
}

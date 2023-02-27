export const COOKIE_PREFIX_KEY = cartEnv();

function cartEnv(): string {
  const cookiePrefixKey = process.env.NEXT_PUBLIC_COOKIE_PREFIX_KEY;
  if (!cookiePrefixKey) {
    throw new Error(
      `Failed to get cart cookie key environment variables cookiePrefixKey id: ${cookiePrefixKey}\n Make sure you have set NEXT_PUBLIC_COOKIE_PREFIX_KEY`
    );
  }
  return cookiePrefixKey;
}

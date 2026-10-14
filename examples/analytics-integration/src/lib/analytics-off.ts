export function isAnalyticsOff(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.EP_ANALYTICS_OFF === "true";
}

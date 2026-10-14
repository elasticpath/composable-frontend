import {
  ANALYTICS_HEADER,
  ANALYTICS_OFF,
  visitorHeaders,
} from "@epcc-sdk/sdks-shopper";
import type { Visitor } from "@epcc-sdk/sdks-shopper";
import { isAnalyticsOff } from "../analytics-off";

export function elasticPathVisitorHeaders(
  visitor: Visitor | undefined,
): Record<string, string> {
  return {
    ...(visitor ? visitorHeaders(visitor) : {}),
    ...(isAnalyticsOff() ? { [ANALYTICS_HEADER]: ANALYTICS_OFF } : {}),
  };
}

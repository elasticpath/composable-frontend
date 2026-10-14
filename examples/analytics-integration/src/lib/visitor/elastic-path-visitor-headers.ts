import {
  ANALYTICS_HEADER,
  ANALYTICS_OFF,
  visitorHeaders,
} from "@epcc-sdk/visitor";
import type { Visitor } from "@epcc-sdk/visitor";
import { isAnalyticsOff } from "../analytics-off";

export function elasticPathVisitorHeaders(
  visitor: Visitor | undefined,
): Record<string, string> {
  return {
    ...(visitor ? visitorHeaders(visitor) : {}),
    ...(isAnalyticsOff() ? { [ANALYTICS_HEADER]: ANALYTICS_OFF } : {}),
  };
}

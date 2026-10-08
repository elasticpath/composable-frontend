import assert from "node:assert/strict"
import * as Metrics from "./dist/index.mjs"

const expected = [
  "createMetricsClient",
  "getOrdersMetricsSummary",
  "getOrdersCountTimeSeries",
  "getOrdersDiscountTimeSeries",
  "getOrdersValueTimeSeries",
  "getProductMetricsSummary",
  "getProductUnitsSoldTimeSeries",
  "getProductValueTimeSeries",
]

for (const name of expected) {
  assert.equal(typeof Metrics[name], "function", `missing export: ${name}`)
}

console.log("Test successful!")

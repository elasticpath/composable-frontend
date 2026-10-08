const assert = require("node:assert/strict")
const Metrics = require("./dist/index.cjs")

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

const OperationPropertyOverride = require("./decorators/operation-property-override.js")
const ComponentMerge = require("./decorators/component-merge.js")

function overridePlugin() {
  return {
    id: "override",
    decorators: {
      oas3: {
        "operation-property-override": OperationPropertyOverride,
        "component-merge": ComponentMerge,
      },
    },
  }
}

module.exports = overridePlugin

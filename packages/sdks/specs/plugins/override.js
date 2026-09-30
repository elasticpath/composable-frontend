const OperationPropertyOverride = require("./decorators/operation-property-override.js")
const ComponentMerge = require("./decorators/component-merge.js")
const PathAdd = require("./decorators/path-add.js")

function overridePlugin() {
  return {
    id: "override",
    decorators: {
      oas3: {
        "operation-property-override": OperationPropertyOverride,
        "component-merge": ComponentMerge,
        "path-add": PathAdd,
      },
    },
  }
}

module.exports = overridePlugin

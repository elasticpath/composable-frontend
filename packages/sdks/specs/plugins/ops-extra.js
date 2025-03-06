const PrefixPaths = require("./preprocessors/prefix-paths.js")
const RemoveV2Server = require("./preprocessors/remove-v2-server.js")
const ExcludeSchemasByExtension = require("./preprocessors/exclude-schema-by-extension.js")
const RenameSchemas = require("./preprocessors/rename-schemas.js")
const FilterOperationsByExtension = require("./preprocessors/filter-operations.js")
const PrefixComponents = require("./preprocessors/prefix-components.js")
const PrefixTags = require("./preprocessors/prefix-tags.js")

function opsExtrasPlugin() {
  return {
    id: "ops-extras",
    preprocessors: {
      oas3: {
        "prefix-paths": PrefixPaths,
        "remove-v2-server": RemoveV2Server,
        "exclude-schema-by-extension": ExcludeSchemasByExtension,
        "rename-schemas": RenameSchemas,
        "filter-operations-by-extension": FilterOperationsByExtension,
        "prefix-components": PrefixComponents,
        "prefix-tags": PrefixTags,
      },
    },
  }
}

module.exports = opsExtrasPlugin

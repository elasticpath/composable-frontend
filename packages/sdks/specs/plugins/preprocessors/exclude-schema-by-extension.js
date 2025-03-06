// exclude-schemas.plugin.js
module.exports = function ExcludeSchemasByExtension(props) {
  // You can customize the extension name and value.
  // Defaults to removing any schema that has `x-exclude: true`.
  const { extensionName = "x-exclude", extensionValue = true } = props

  return {
    Components: {
      leave(components) {
        // If there are no schemas, just exit early
        if (!components.schemas) return

        // Iterate over each schema in components.schemas
        for (const [schemaName, schema] of Object.entries(components.schemas)) {
          // Check if the extension matches the user’s criteria
          if (schema[extensionName] === extensionValue) {
            // Delete the schema from the AST in place
            delete components.schemas[schemaName]
          }
        }
      },
    },
  }
}

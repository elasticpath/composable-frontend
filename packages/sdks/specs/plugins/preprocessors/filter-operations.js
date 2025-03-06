module.exports = function FilterOperationsByExtension({
  extensionName = "x-sdk-filter",
  extensionValues = [],
} = {}) {
  // The common HTTP methods we expect to find in an OpenAPI PathItem
  const METHODS = [
    "get",
    "put",
    "post",
    "delete",
    "options",
    "head",
    "patch",
    "trace",
  ]

  return {
    Paths: {
      leave(paths) {
        // Loop over each path
        for (const [pathKey, pathItem] of Object.entries(paths)) {
          // For each method, check if it should be kept or removed
          for (const method of METHODS) {
            const operation = pathItem[method]
            if (!operation) continue // No operation for this method

            const extValue = operation[extensionName]

            // If extension is missing, or doesn't match our desired value(s),
            // remove this operation from the path item.
            if (!extValue) {
              delete pathItem[method]
              continue
            }

            // Decide if we keep or remove:
            // - If operation's extension is an array, we check intersection with `extensionValues`.
            // - If it's a single value (string/number/etc.), we see if it's in `extensionValues`.
            let keep = false
            if (Array.isArray(extValue)) {
              // Keep operation if there's any overlap with the user-supplied list
              keep = extValue.some((val) => extensionValues.includes(val))
            } else {
              // Treat extension as a single value
              keep = extensionValues.includes(extValue)
            }

            // If we do NOT keep it, remove the operation
            if (!keep) {
              delete pathItem[method]
            }
          }

          // After pruning operations, check if the path item still has any methods left
          const hasAtLeastOneMethod = METHODS.some((m) => pathItem[m])
          if (!hasAtLeastOneMethod) {
            // Remove the entire path if no operations remain
            delete paths[pathKey]
          }
        }
      },
    },
  }
}

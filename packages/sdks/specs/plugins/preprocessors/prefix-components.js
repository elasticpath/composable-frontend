module.exports = function PrefixComponents({
  // Default prefix (you can override in .redocly.yaml).
  prefix = "MyPrefix_",
  // Which parts of `components` should be prefixed?
  // Common ones: schemas, parameters, responses, requestBodies, headers, securitySchemes
  targets = ["schemas", "parameters", "responses"],
  // If filterKeys is provided, only those keys will be prefixed.
  // If empty or not provided, all keys get prefixed.
  filterKeys = [],
} = {}) {
  return {
    Root: {
      leave(root) {
        const components = root.components
        if (!components) return

        // Go through each targeted component section
        for (const compKey of targets) {
          if (!components[compKey]) continue

          const originalNames = Object.keys(components[compKey])

          for (const oldName of originalNames) {
            // If filterKeys is provided and NOT empty, skip anything not in the list
            if (filterKeys.length > 0 && !filterKeys.includes(oldName)) {
              continue
            }

            // e.g., oldName = "Timestamps" => newName = "MyPrefix_Timestamps"
            const newName = prefix + oldName

            // Skip if the new name already exists to avoid overwriting
            if (components[compKey][newName]) {
              console.warn(
                `[PrefixComponentsPlugin] Cannot rename "${oldName}" to "${newName}" because "${newName}" already exists under components.${compKey}. Skipping...`,
              )
              continue
            }

            // Move the definition under the new key
            components[compKey][newName] = components[compKey][oldName]
            // Remove the old key
            delete components[compKey][oldName]

            // Fix all $ref references in the spec from the old name to the new
            fixRefs(
              root,
              `#/components/${compKey}/${oldName}`,
              `#/components/${compKey}/${newName}`,
            )
          }
        }
      },
    },
  }
}

/**
 * Recursively updates all $ref strings from oldRef -> newRef in the given object.
 */
function fixRefs(obj, oldRef, newRef) {
  if (!obj || typeof obj !== "object") return

  for (const key of Object.keys(obj)) {
    const val = obj[key]
    if (key === "$ref" && val === oldRef) {
      obj[key] = newRef
    } else if (val && typeof val === "object") {
      fixRefs(val, oldRef, newRef)
    }
  }
}

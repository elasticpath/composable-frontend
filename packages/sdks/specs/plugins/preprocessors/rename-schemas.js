module.exports = function RenameSchemas({ renamePairs = {} }) {
  return {
    Root: {
      leave(root) {
        const schemas = root?.components?.schemas
        if (!schemas) return

        for (const [oldName, newName] of Object.entries(renamePairs)) {
          // Check if oldName exists under components.schemas
          if (schemas[oldName]) {
            // Make sure newName doesn't already exist to avoid overwriting
            if (schemas[newName]) {
              console.warn(
                `Warning: Cannot rename "${oldName}" to "${newName}" because "${newName}" already exists in components.schemas. Skipping...`,
              )
              continue
            }

            // Rename in place
            schemas[newName] = schemas[oldName]
            delete schemas[oldName]

            // Fix all $ref occurrences that pointed to the old name
            fixRefs(
              root,
              `#/components/schemas/${oldName}`,
              `#/components/schemas/${newName}`,
            )
          }
        }
      },
    },
  }
}

/**
 * Recursively updates all $ref strings in the spec:
 * from oldRef -> newRef
 */
function fixRefs(obj, oldRef, newRef) {
  if (typeof obj !== "object" || obj === null) {
    return
  }

  for (const key of Object.keys(obj)) {
    const val = obj[key]

    // If this is a $ref with the oldRef value, rewrite it
    if (key === "$ref" && val === oldRef) {
      obj[key] = newRef
    } else if (typeof val === "object" && val !== null) {
      // Recurse deeper
      fixRefs(val, oldRef, newRef)
    }
  }
}

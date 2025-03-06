module.exports = function PrefixTags({
  prefix = "MyPrefix_",
  filterTags = [],
} = {}) {
  return {
    Root: {
      leave(root) {
        if (!root.tags) return

        // Build a map of oldName -> newName for the tags we want to rename
        const renameMap = {}

        // 1) Rename each top-level tag's `name` property, if it passes the filter
        for (const tagObj of root.tags) {
          const oldName = tagObj.name

          // If `filterTags` is empty, rename all. Otherwise, rename only if oldName is in filterTags.
          const shouldRename =
            filterTags.length === 0 || filterTags.includes(oldName)

          if (shouldRename) {
            const newName = prefix + oldName
            renameMap[oldName] = newName

            // Mutate the top-level tag
            tagObj.name = newName
          }
        }

        // 2) Recursively fix all references to these tags in operations
        fixOperationTags(root, renameMap)
      },
    },
  }
}

/**
 * Recursively walk the entire spec (root),
 * and wherever we see `operation.tags` that match
 * an oldName in renameMap, update to the newName.
 */
function fixOperationTags(obj, renameMap) {
  if (!obj || typeof obj !== "object") return

  // If this object has a `tags` property that is an array of strings,
  // rename any matching tag names
  if (Array.isArray(obj.tags)) {
    obj.tags = obj.tags.map((tagName) =>
      renameMap[tagName] ? renameMap[tagName] : tagName,
    )
  }

  // Recurse into all child properties
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    if (val && typeof val === "object") {
      fixOperationTags(val, renameMap)
    }
  }
}

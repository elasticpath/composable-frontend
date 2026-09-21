const PrefixPaths = (props) => {
  const { prefix = "/v2" } = props

  return {
    Paths: {
      leave(paths) {
        // create the new keys
        const newPaths = {}
        for (const [pathKey, pathItem] of Object.entries(paths || {})) {
          // Idempotent: canonical has re-baselined some specs onto prefixed paths.
          const newKey =
            pathKey === prefix || pathKey.startsWith(prefix + "/")
              ? pathKey
              : prefix + pathKey
          newPaths[newKey] = pathItem
        }

        // remove original keys
        for (const key of Object.keys(paths)) {
          delete paths[key]
        }

        // copy over new keys
        Object.assign(paths, newPaths)
      },
    },
  }
}

module.exports = PrefixPaths

const resolve1 = require("@redocly/openapi-core/lib/resolve")
const _ = require("lodash")
const {
  HTTP_METHODS,
  assertRefsResolve,
  readOverride,
  resolveMergeRefs,
} = require("./component-merge.js")

// component-merge only changes what the spec already has. This adds paths the published spec
// lacks, and fails once the spec gains one of them, so the override is deleted rather than
// silently shadowing the published operation.
const PathAdd = (props) => {
  const mergeRefs = resolveMergeRefs(props.mergeRef)

  return {
    Root: {
      leave(root, { report, location }) {
        try {
          const externalResolver = new resolve1.BaseResolver()

          for (const mergeRef of mergeRefs) {
            const additions = readOverride(externalResolver, mergeRef).parsed

            assertNothingExists(root, additions, mergeRef)

            root.paths = { ...root.paths, ...additions.paths }
            root.components = _.merge(root.components ?? {}, additions.components)

            assertRefsResolve(root, additions, mergeRef)
          }
        } catch (e) {
          report({
            message: `Failed to add paths.\n${e.message}`,
            location: location.key(),
          })
        }
      },
    },
  }
}

// Paths differing only in parameter names are one route: /a/{id} and /a/{slug}.
function routeOf(pathKey) {
  return pathKey.replace(/\{[^}]*\}/g, "{}")
}

function operationIds(paths) {
  const ids = new Set()
  for (const pathItem of Object.values(paths ?? {})) {
    for (const [key, operation] of Object.entries(pathItem ?? {})) {
      if (HTTP_METHODS.has(key) && operation?.operationId) {
        ids.add(operation.operationId)
      }
    }
  }
  return ids
}

function assertNothingExists(root, additions, mergeRef) {
  const routes = new Map(
    Object.keys(root.paths ?? {}).map((key) => [routeOf(key), key]),
  )
  for (const pathKey of Object.keys(additions.paths ?? {})) {
    const existing = routes.get(routeOf(pathKey))
    if (existing) {
      throw new Error(
        `${mergeRef} adds path "${pathKey}", which the spec now has as "${existing}". Delete the override.`,
      )
    }
  }

  const ids = operationIds(root.paths)
  for (const id of operationIds(additions.paths)) {
    if (ids.has(id)) {
      throw new Error(
        `${mergeRef} adds operationId "${id}", which the spec now has. Delete the override.`,
      )
    }
  }

  for (const [section, entries] of Object.entries(additions.components ?? {})) {
    for (const name of Object.keys(entries ?? {})) {
      if (root.components?.[section]?.[name]) {
        throw new Error(
          `${mergeRef} adds components.${section}.${name}, which the spec now has. Delete it from the override.`,
        )
      }
    }
  }
}

module.exports = PathAdd

// import { readFileAsStringSync } from "../../utils"
const resolve1 = require("@redocly/openapi-core/lib/resolve")
const fs = require("fs")
const path = require("path")
const _ = require("lodash")

const ComponentMerge = (props) => {
  const { mergeRef: sourceMergeRef } = props

  const redoclyConfigPath = path.resolve(__dirname, "../../config/redocly.yaml")

  // Files are merged in the order given, each deep-merged onto the result of the last.
  const sourceMergeRefs = Array.isArray(sourceMergeRef)
    ? sourceMergeRef
    : sourceMergeRef
      ? [sourceMergeRef]
      : []

  return {
    Root: {
      leave(root, { report, location }) {
        try {
          const externalResolver = new resolve1.BaseResolver()

          for (const sourceRef of sourceMergeRefs) {
            let mergeRef
            if (path.isAbsolute(sourceRef)) {
              mergeRef = sourceRef
            } else {
              mergeRef = path.resolve(
                path.dirname(redoclyConfigPath),
                sourceRef,
              )
            }

            if (fs.lstatSync(mergeRef).isDirectory()) {
              throw new Error(
                `Expected a file but received a folder at ${mergeRef}`,
              )
            }

            const content = fs.readFileSync(mergeRef, "utf-8")
            // In some cases file have \r\n line delimeters like on windows, we should skip it.
            const source = new resolve1.Source(
              mergeRef,
              content.replace(/\r\n/g, "\n"),
            )

            const document = externalResolver.parseDocument(source, false)

            assertOverriddenOperationsExist(root, document.parsed, mergeRef)

            const updated = _.merge(root, document.parsed)

            assertRefsResolve(root, document.parsed, mergeRef)

            updateObjectProperties(root, updated)
          }
        } catch (e) {
          report({
            message: `Failed to merge component.\n${e.message}`,
            location: location.key(),
          })
        }
      },
    },
  }
}

const HTTP_METHODS = new Set([
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
])

// An override may only repoint a response the spec already has; components it may add.
function assertOverriddenOperationsExist(root, overrides, mergeRef) {
  for (const [pathKey, pathItem] of Object.entries(overrides.paths ?? {})) {
    if (!root.paths?.[pathKey]) {
      throw new Error(
        `${mergeRef} overrides path "${pathKey}", which the spec does not have`,
      )
    }
    for (const key of Object.keys(pathItem ?? {})) {
      // Only operations; a path item also carries parameters, summary and the like.
      if (!HTTP_METHODS.has(key)) continue
      const operation = root.paths[pathKey][key]
      if (!operation) {
        throw new Error(
          `${mergeRef} overrides "${key} ${pathKey}", which the spec does not have`,
        )
      }
      for (const status of Object.keys(pathItem[key].responses ?? {})) {
        if (!operation.responses?.[status]) {
          throw new Error(
            `${mergeRef} overrides "${key} ${pathKey}" response ${status}, which the spec does not have`,
          )
        }
      }
    }
  }
}

// Every component an override points at has to exist once its merge is done, or the bundle
// carries a dangling $ref.
function assertRefsResolve(root, overrides, mergeRef) {
  for (const ref of collectRefs(overrides)) {
    const [, section, name] = /^#\/components\/([^/]+)\/(.+)$/.exec(ref) ?? []
    if (!section) continue
    if (!root.components?.[section]?.[name]) {
      throw new Error(
        `${mergeRef} references "${ref}", which the spec does not have`,
      )
    }
  }
}

function collectRefs(node, found = new Set()) {
  if (Array.isArray(node)) {
    for (const item of node) collectRefs(item, found)
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "$ref" && typeof value === "string") found.add(value)
      else collectRefs(value, found)
    }
  }
  return found
}

function updateObjectProperties(obj, newValues) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && newValues.hasOwnProperty(key)) {
      obj[key] = newValues[key]
    }
  }
}

module.exports = ComponentMerge

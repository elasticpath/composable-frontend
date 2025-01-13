// import { readFileAsStringSync } from "../../utils"
const resolve1 = require("@redocly/openapi-core/lib/resolve")
const fs = require("fs")
const path = require("path")
const _ = require("lodash")

const ComponentMerge = (props) => {
  const { mergeRef: sourceMergeRef } = props

  const redoclyConfigPath = path.resolve(__dirname, "../../config/redocly.yaml")

  return {
    Root: {
      leave(root, { report, location }) {
        try {
          const externalResolver = new resolve1.BaseResolver()

          if (!sourceMergeRef) {
            return
          }

          let mergeRef
          if (path.isAbsolute(sourceMergeRef)) {
            mergeRef = sourceMergeRef
          } else {
            mergeRef = path.resolve(
              path.dirname(redoclyConfigPath),
              sourceMergeRef,
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

          const updated = _.merge(root, document.parsed)

          updateObjectProperties(root, updated)
        } catch (e) {
          report({
            message: `Failed to merge component.`,
            location: location.key(),
          })
        }
      },
    },
  }
}

function updateObjectProperties(obj, newValues) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && newValues.hasOwnProperty(key)) {
      obj[key] = newValues[key]
    }
  }
}

module.exports = ComponentMerge

const resolve1 = require("@redocly/openapi-core/lib/resolve")
const fs = require("fs")
const path = require("path")
const _ = require("lodash")

const OperationPropertyOverride = (props) => {
  const { operationIds } = props

  const redoclyConfigPath = path.resolve(__dirname, "../../config/redocly.yaml")

  return {
    Operation: {
      leave(operation, { report, location }) {
        if (!operation.operationId) return
        if (!operationIds)
          throw new Error(
            `Parameter "operationIds" is not provided for "operation-property-override" rule`,
          )
        const operationId = operation.operationId

        const opRawPath = operationIds[operationId]

        if (!opRawPath) {
          return
        }

        let operationFileRef
        if (path.isAbsolute(opRawPath)) {
          operationFileRef = opRawPath
        } else {
          operationFileRef = path.resolve(
            path.dirname(redoclyConfigPath),
            opRawPath,
          )
        }

        if (operationFileRef) {
          try {
            const externalResolver = new resolve1.BaseResolver()

            if (fs.lstatSync(operationFileRef).isDirectory()) {
              throw new Error(
                `Expected a file but received a folder at ${operationFileRef}`,
              )
            }

            const content = fs.readFileSync(operationFileRef, "utf-8")
            // In some cases file have \r\n line delimeters like on windows, we should skip it.
            const source = new resolve1.Source(
              operationFileRef,
              content.replace(/\r\n/g, "\n"),
            )

            const document = externalResolver.parseDocument(source, false)

            const mergedValues = _.mergeWith(
              {},
              operation,
              document.parsed,
              mergeArraysCustomizer,
            )

            updateObjectProperties(operation, mergedValues)
          } catch (e) {
            report({
              message: `Failed to read markdown override file for operation "${operationId}".\n${e.message}`,
              location: location.child("operationId").key(),
            })
          }
        }
      },
    },
  }
}

function mergeArraysCustomizer(objValue, srcValue) {
  // If both values are arrays, return a new array that concatenates them
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return objValue.concat(srcValue)
  }
  // Otherwise let Lodash handle the merge
  return undefined
}

function updateObjectProperties(obj, newValues) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && newValues.hasOwnProperty(key)) {
      obj[key] = newValues[key]
    }
  }
}

module.exports = OperationPropertyOverride

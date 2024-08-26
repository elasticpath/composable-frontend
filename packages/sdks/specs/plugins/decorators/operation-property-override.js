const resolve1 = require("@redocly/openapi-core/lib/resolve")
const fs = require("fs")
const _ = require("lodash")

const OperationPropertyOverride = (props) => {
  const { operationIds } = props
  return {
    Operation: {
      leave(operation, { report, location }) {
        if (!operation.operationId) return
        if (!operationIds)
          throw new Error(
            `Parameter "operationIds" is not provided for "operation-property-override" rule`,
          )
        const operationId = operation.operationId
        const operationFileRef = operationIds[operationId]
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

            const mergedValues = _.merge(operation, document.parsed)
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

function updateObjectProperties(obj, newValues) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && newValues.hasOwnProperty(key)) {
      obj[key] = newValues[key]
    }
  }
}

module.exports = OperationPropertyOverride

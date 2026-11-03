const RemoveInvalidEnumDefaults = (_props) => {
  return {
    Schema: {
      leave(schema) {
        if (hasDefaultOutsideEnum(schema)) {
          delete schema.default
        }
      },
    },
  }
}

function hasDefaultOutsideEnum(schema) {
  return (
    Array.isArray(schema.enum) &&
    "default" in schema &&
    !schema.enum.includes(schema.default)
  )
}

module.exports = RemoveInvalidEnumDefaults

import React from "react"
import { Box, Text } from "ink"

export function PublishCatalogMsg() {
  return (
    <Box flexDirection="column">
      <Text>Don't forget to publish a catalog...</Text>
      <Text>
        In order to see the Algolia integration in action you will need to
        publish a catalog.
      </Text>
    </Box>
  )
}

import React from "react"
import { Box, Text } from "ink"

export function UnauthenticatedMessage() {
  return (
    <Box>
      <Text>It seems you are not currently authenticated.</Text>
      <Text>
        If you already have an Elasticpath account, you can use the following
        command to authenticate and access your account:
      </Text>
      <Text>elasticpath login</Text>
      <Text>
        If you haven't registered for an Elasticpath account yet, you can sign
        up for a free account by visiting our website:
      </Text>
    </Box>
  )
}

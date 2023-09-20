import React from "react"
import { Box, Text } from "ink"

export function LogoutNote() {
  return (
    <Box flexDirection="column">
      <Text>Successfully logged out of Elasticpath composable cli</Text>
      <Text>
        We value your feedback! Please let us know about your experience by
        using the `feedback` command `composable-cli feedback`.
      </Text>
    </Box>
  )
}

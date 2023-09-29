import React from "react"
import { Box, Newline, Text } from "ink"
import Table from "ink-table"

export function ErrorTable({ data }: { data: Record<string, any> }) {
  const errors = Object.keys(data).map((key) => {
    return { key, value: data[key] }
  })

  return (
    <Box flexDirection="column">
      <Box marginY={1}>
        <Text bold color="red">
          There was an issue!
        </Text>
      </Box>
      <Text>
        To get support on this issue, report it on our slack community.
        <Newline />
        Join us at
        <Text color="green">
          {" "}
          https://elasticpathcommunity.slack.com/join/shared_invite/zt-1upzq3nlc-O3sy1bT0UJYcOWEQQCtnqw
        </Text>
      </Text>
      <Table data={errors} />
    </Box>
  )
}

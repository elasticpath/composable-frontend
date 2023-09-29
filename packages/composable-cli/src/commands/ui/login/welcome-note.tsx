import React from "react"
import Gradient from "ink-gradient"
import BigText from "ink-big-text"
import { Box, Newline, Text } from "ink"

export function WelcomeNote({ name }: { name: string }) {
  return (
    <>
      <Gradient name="summer">
        <BigText font={"tiny"} text="Composable CLI" lineHeight={2} />
      </Gradient>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="#2BCC7E"
        margin={1}
        padding={1}
      >
        <Text>
          👋 <Text bold>{name}</Text> welcome to Elasticpath composable cli
        </Text>
        <Newline />
        <Text>A CLI for managing your Elasticpath powered storefront</Text>
        <Newline />
        <Box marginY={1}>
          <Text>
            To get support or ask any question, join us in our slack community.
            <Newline />
            <Text color="green">
              https://elasticpathcommunity.slack.com/join/shared_invite/zt-1upzq3nlc-O3sy1bT0UJYcOWEQQCtnqw
            </Text>
          </Text>
        </Box>
      </Box>
    </>
  )
}

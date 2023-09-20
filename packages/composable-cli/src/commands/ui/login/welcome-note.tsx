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
      </Box>
    </>
  )
}

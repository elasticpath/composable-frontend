import React from "react"
import { Box, Newline, Text } from "ink"

export function Feedback() {
  return (
    <Box
      flexDirection="column"
      alignItems="center"
      borderStyle="round"
      borderColor="#2BCC7E"
      margin={1}
      padding={1}
    >
      <Text bold>🌟 Your Feedback Matters! 🌟</Text>
      <Newline />
      <Text>
        Thank you for taking the time to provide us with your valuable feedback!
        We greatly appreciate your input, as it helps us shape the future of
        composable cli.
      </Text>
      <Text>
        Your opinion is essential in making our tools better than ever. Simply
        follow the link below to our feedback site, where you can share your
        thoughts, suggestions, and ideas:
      </Text>
      <Newline />
      <Text>https://elasticpath.dev/docs</Text>
    </Box>
  )
}

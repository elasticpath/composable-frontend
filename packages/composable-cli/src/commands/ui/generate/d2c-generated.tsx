import React from "react"
import { Box, Text } from "ink"

export function D2CGenerated({
  name,
  nodePkgManager,
  skipInstall,
}: {
  name: string
  nodePkgManager: "yarn" | "npm" | "pnpm" | "bun"
  skipInstall: boolean
}) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="#2BCC7E"
      padding={1}
    >
      <Text color="green">Next steps:</Text>
      {constructSteps({ name, nodePkgManager, skipInstall }).map(
        (step, index) => (
          <Text key={index}>
            - Step {index + 1}: {step}
          </Text>
        )
      )}
    </Box>
  )
}

function constructSteps({
  name,
  nodePkgManager,
  skipInstall,
}: {
  name: string
  nodePkgManager: "yarn" | "npm" | "pnpm" | "bun"
  skipInstall: boolean
}) {
  return [
    `Navigate to your project directory using 'cd ${name}'`,
    ...(skipInstall
      ? [`Run install using '${resolveInstallCommand(nodePkgManager)}'`]
      : []),
    `Start the development server using '${resolveStartCommand(
      nodePkgManager
    )}'`,
  ]
}

function resolveStartCommand(nodePkgManager: "yarn" | "npm" | "pnpm" | "bun") {
  switch (nodePkgManager) {
    case "yarn":
      return "yarn run dev"
    case "npm":
      return "npm run dev"
    case "pnpm":
      return "pnpm run dev"
    case "bun":
      return "bun run dev"
  }
}

function resolveInstallCommand(
  nodePkgManager: "yarn" | "npm" | "pnpm" | "bun"
) {
  switch (nodePkgManager) {
    case "yarn":
      return "yarn install"
    case "npm":
      return "npm install"
    case "pnpm":
      return "pnpm install"
    case "bun":
      return "bun install"
  }
}

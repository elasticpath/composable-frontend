import React from "react"
import { Box, Newline, Text } from "ink"

export function D2CGenerated({
  name,
  nodePkgManager,
  notes,
}: {
  name: string
  nodePkgManager: "yarn" | "npm" | "pnpm" | "bun"
  notes: { title: string; description: string }[]
}) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="#2BCC7E"
      padding={1}
    >
      <Text color="green" bold>
        Next steps:
      </Text>
      <Newline />
      {constructSteps({ name, nodePkgManager, hasNotes: notes.length > 0 }).map(
        (step, index) => (
          <Text key={index}>
            - Step {index + 1}: {step}
          </Text>
        ),
      )}
      <Newline />
      {notes.length > 0 && (
        <>
          <Text bold color="green">
            Additional Setup
          </Text>
          <Newline />
          {notes.map((note) => {
            return (
              <Box
                key={note.title}
                flexDirection="column"
                padding={1}
                borderStyle="single"
              >
                <Text bold>{note.title}</Text>
                <Newline />
                <Text>{note.description}</Text>
              </Box>
            )
          })}
        </>
      )}
    </Box>
  )
}

function constructSteps({
  name,
  nodePkgManager,
  hasNotes,
}: {
  name: string
  nodePkgManager: "yarn" | "npm" | "pnpm" | "bun"
  hasNotes: boolean
}) {
  return [
    `Navigate to your project directory using 'cd ${name}'`,
    `Run install using '${resolveInstallCommand(nodePkgManager)}'`,
    ...(hasNotes ? ["Follow the additional setup steps below"] : []),
    `Start the development server using '${resolveStartCommand(
      nodePkgManager,
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
  nodePkgManager: "yarn" | "npm" | "pnpm" | "bun",
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

import type { Preview } from "@storybook/react"
import DefaultElasticPathProvider from "./elasticpath-context"
import React from "react"

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <DefaultElasticPathProvider>
        <Story />
      </DefaultElasticPathProvider>
    ),
  ],
}

export default preview

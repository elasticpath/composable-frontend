import type { Preview } from "@storybook/react"
import DefaultElasticPathProvider from "./elasticpath-context"
import React from "react"
import { initialize, mswDecorator, mswLoader } from "msw-storybook-addon"
import { shopperHandlers } from "../mocks/handlers"

initialize()

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    msw: {
      handlers: [...shopperHandlers],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
  decorators: [
    mswDecorator,
    (Story) => (
      <DefaultElasticPathProvider>
        <Story />
      </DefaultElasticPathProvider>
    ),
  ],
}

export default preview

import React, { Fragment } from "react"
import { render } from "ink"
import { exit } from "process"

export const renderInk = async (component: React.ReactElement) => {
  const { waitUntilExit } = render(React.createElement(Fragment, {}, component))

  try {
    await waitUntilExit()
  } catch (e: any) {
    console.error(e.message)
    exit(1)
  }
}

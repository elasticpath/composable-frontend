import React, { FunctionComponent } from "react"
import Gradient from "ink-gradient"
import BigText from "ink-big-text"
import { Alert, AlertProps } from "../components/Alert"

export type WelcomeNoteProps = AlertProps

export const WelcomeNote: FunctionComponent<WelcomeNoteProps> = (props) => {
  return (
    <>
      <Gradient name="summer">
        <BigText font={"tiny"} text="Composable CLI" lineHeight={2} />
      </Gradient>
      <Alert {...props} />
    </>
  )
}

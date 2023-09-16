import { EpccUserProfileSuccessResponse } from "../../lib/epcc-user-profile-schema"
import * as ansiColors from "ansi-colors"
import { version } from "../../../package.json"

export function outputWelcome(user: EpccUserProfileSuccessResponse): void {
  // Configure.
  const colors = ansiColors.create()
  const bg = colors.bgGreenBright.inverse.bold
  const clr = colors.blue.bold

  const title = `👋 ${user.data.name} welcome to Elasticpath composable cli`
  const description = "A CLI for managing your Elasticpath powered storefront"

  console.log()
  console.log(
    `${clr(`${bg(` ${title} `)}`)} v${version}\n${colors.dim(description)}`
  )
  console.log()
}

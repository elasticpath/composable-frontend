import { Banner, BannerType } from "./Banner"
import { Link } from "./Link"
import { List } from "./List"
import {
  BoldToken,
  InlineToken,
  LinkToken,
  TokenItem,
  TokenizedText,
} from "./TokenizedText"
import { Box, Text } from "ink"
import React, { FunctionComponent } from "react"

export interface CustomSection {
  title?: string
  body: TokenItem
}

export interface AlertProps {
  type: Exclude<BannerType, "external_error">
  headline?: TokenItem<Exclude<InlineToken, LinkToken | BoldToken>>
  body?: TokenItem
  nextSteps?: TokenItem<InlineToken>[]
  reference?: TokenItem<InlineToken>[]
  link?: {
    label: string
    url: string
  }
  orderedNextSteps?: boolean
  customSections?: CustomSection[]
}

const Alert: FunctionComponent<AlertProps> = ({
  type,
  headline,
  body,
  nextSteps,
  reference,
  link,
  customSections,
  orderedNextSteps = false,
}) => {
  return (
    <Banner type={type}>
      {headline ? (
        <Box marginBottom={1}>
          <Text bold>
            <TokenizedText item={headline} />
          </Text>
        </Box>
      ) : null}

      {body ? <TokenizedText item={body} /> : null}

      {nextSteps && nextSteps.length > 0 ? (
        <List title="Next steps" items={nextSteps} ordered={orderedNextSteps} />
      ) : null}

      {reference && reference.length > 0 ? (
        <List title="Reference" items={reference} />
      ) : null}

      {link ? <Link url={link.url} label={link.label} /> : null}

      {customSections && customSections.length > 0 ? (
        <Box flexDirection="column">
          {customSections.map((section, index) => (
            <Box key={index} flexDirection="column" marginTop={1}>
              {section.title ? <Text bold>{section.title}</Text> : null}
              <TokenizedText item={section.body} />
            </Box>
          ))}
        </Box>
      ) : null}
    </Banner>
  )
}

export { Alert }

export const SetupIntegrationName = "setup-integration"

export interface SetupIntegrationTaskFactoryOptions {
  rootDirectory?: string
}

export interface SetupIntegrationTaskOptions {
  workingDirectory?: string
  commit?: boolean
  message?: string
  authorName?: string
  authorEmail?: string
}

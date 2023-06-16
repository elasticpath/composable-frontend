import {
  TaskConfiguration,
  TaskConfigurationGenerator,
} from "@angular-devkit/schematics"
import { SetupIntegrationName, SetupIntegrationTaskOptions } from "./options"

export interface CommitOptions {
  message?: string
  name?: string
  email?: string
}

export class SetupIntegrationTask
  implements TaskConfigurationGenerator<SetupIntegrationTaskOptions>
{
  constructor(
    public workingDirectory?: string,
    public commitOptions?: CommitOptions
  ) {}

  toConfiguration(): TaskConfiguration<SetupIntegrationTaskOptions> {
    return {
      name: SetupIntegrationName,
      options: {
        commit: !!this.commitOptions,
        workingDirectory: this.workingDirectory,
        authorName: this.commitOptions && this.commitOptions.name,
        authorEmail: this.commitOptions && this.commitOptions.email,
        message: this.commitOptions && this.commitOptions.message,
      },
    }
  }
}

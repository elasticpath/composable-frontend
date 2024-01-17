import {
  addAllToGitFromDirectory,
  createGitCommit,
  initializeGitRepository,
} from "../../git"
import { outputDebug } from "../../output"

export async function createInitialCommit(directory: string) {
  try {
    await initializeGitRepository(directory)

    return commitAll(directory, "Storefront scaffolding")
  } catch (error: any) {
    // Ignore errors
    outputDebug(
      "Failed to initialize Git.\n" + error?.stack ?? error?.message ?? error,
    )
  }
}

export async function commitAll(directory: string, message: string) {
  try {
    await addAllToGitFromDirectory(directory)
    await createGitCommit(message, { directory })
  } catch (error: any) {
    // Ignore errors
    outputDebug(
      "Failed to commit code.\n" + error?.stack ?? error?.message ?? error,
    )
  }
}

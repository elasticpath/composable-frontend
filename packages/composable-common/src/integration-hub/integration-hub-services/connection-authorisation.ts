import {
  Instance,
  InstanceConfigVariable,
  Maybe,
  Scalars,
} from "../../codegen/gql/graphql"
import fetch from "node-fetch"
import { handleCatchError } from "../helpers"

type ConnectionResults =
  | {
      success: true
      connectionsMade: ConnectionResult[]
    }
  | { success: false; connectionsMade: ConnectionResult[]; error: Error }

type ConnectionResult = {
  name: string
  id: string
  success: boolean
  error?: Error
}

export async function performConnectionConfigAuthorisation(
  instance: Instance
): Promise<ConnectionResults> {
  const configs = instance.configVariables.nodes

  if (configs === null) {
    return {
      success: true,
      connectionsMade: [],
    }
  }

  const connectionConfigs = configs.filter(isPendingConnectionConfigWithAuthUrl)

  const connectionAuthAttemptPromises: Promise<ConnectionResult>[] =
    connectionConfigs.map(attemptConnection)

  return Promise.all(connectionAuthAttemptPromises).then(formatConnectionResult)
}

async function attemptConnection(
  pendingConfig: PendingConnectionConfig
): Promise<ConnectionResult> {
  const {
    authorizeUrl,
    requiredConfigVariable: { key, id },
  } = pendingConfig
  let result: {
    success: boolean
    error?: Error
  }
  try {
    const response = await fetch(authorizeUrl, {
      redirect: "follow",
    })

    if (response?.status >= 200 && response?.status < 300) {
      result = {
        success: true,
      }
    } else {
      result = {
        success: false,
        error: new Error(`Server response was not ok ${response?.status}`),
      }
    }
  } catch (err) {
    result = {
      success: false,
      error: handleCatchError(err),
    }
  }

  return {
    success: result.success,
    name: key,
    id: id,
    error: result.error,
  }
}

function formatConnectionResult(
  results: ConnectionResult[]
): ConnectionResults {
  return results.some(({ success }) => !success)
    ? {
        success: false,
        error: new Error("One or more connections failed"),
        connectionsMade: results,
      }
    : ({ success: true, connectionsMade: results } as ConnectionResults)
}

type PendingConnectionConfig = Omit<InstanceConfigVariable, "authorizeUrl"> & {
  authorizeUrl: Scalars["String"]
}

function isPendingConnectionConfigWithAuthUrl(
  value: Maybe<InstanceConfigVariable>
): value is PendingConnectionConfig {
  return (
    value !== null &&
    value.requiredConfigVariable.dataType === "CONNECTION" &&
    value.status === "PENDING" &&
    !!value.authorizeUrl
  )
}

import {
  Instance,
  InstanceConfigVariable,
  Maybe,
  Scalars,
} from "../../../codegen/gql/graphql"
import { fetch } from "../temp-pris-script"

export async function performConnectionConfigAuthorisation(
  instance: Instance
): Promise<any> {
  const configs = instance.configVariables.nodes

  if (configs === null) {
    return true
  }

  const connectionConfigs = configs.filter(isPendingConnectionConfigWithAuthUrl)

  const connectionAuthAttemptPromises = connectionConfigs.map((connection) => {
    console.log("connection config: ", connection)
    return fetch(connection.authorizeUrl, { redirect: "follow" })
  })

  return Promise.all(connectionAuthAttemptPromises)
}

function isPendingConnectionConfigWithAuthUrl(
  value: Maybe<InstanceConfigVariable>
): value is Omit<InstanceConfigVariable, "authorizeUrl"> & {
  authorizeUrl: Scalars["String"]
} {
  return (
    value !== null &&
    value.requiredConfigVariable.dataType === "CONNECTION" &&
    value.status === "PENDING" &&
    !!value.authorizeUrl
  )
}

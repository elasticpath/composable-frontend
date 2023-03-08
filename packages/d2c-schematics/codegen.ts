import { CodegenConfig } from "@graphql-codegen/cli"

const authToken = process.env.CODEGEN_GRAPHQL_IH_TOKEN

const config: CodegenConfig = {
  schema: {
    "https://us-east-2.elasticpathintegrations.com/api/": {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  },
  documents: ["utility/integration-hub/prismatic-queries/**/*.ts"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./codegen/gql/": {
      preset: "client",
      plugins: [],
    },
  },
}

export default config

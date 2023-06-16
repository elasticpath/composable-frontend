import { graphql, rest } from "msw"

export const handlers = [
  rest.get("https://test-connection-url/expect-success", (req, res, ctx) => {
    return res(ctx.status(200), ctx.text("success"))
  }),
  rest.get("https://test-connection-url/expect-failure", (req, res, ctx) => {
    return res(ctx.status(500))
  }),

  graphql.query("getUserInfo", (req, res, ctx) => {
    return res(
      ctx.data({
        authenticatedUser: {
          id: "VXNlcjpkOGM1NDQ2MS04MjE5LTRiNmItOTMzZC1lZGQzYWZhODIyZTY=",
          email: "3231f620-643a-4375-ace5-033a9418114a_store_user_integration",
          name: "",
          avatarUrl: null,
          appName: "Elasticpath - Dev",
          marketplaceName: "Integrations Hub",
          appAvatarUrl: null,
          darkMode: false,
          darkModeSyncWithOs: true,
          dateJoined: "2023-03-24T17:19:21.189454+00:00",
          featureFlags:
            '{"embeddedDesignerUI": true, "embeddedDesignerCreateIntegrationFlow": true}',
          org: null,
          customer: {
            id: "Q3VzdG9tZXI6ZjViNWU5NGMtNGI4Zi00ZTljLWEyZTUtMWY4YTMyMjAwNjE3",
            org: [Object],
            name: "FreeTrial1679060603 - store_integration_3231f620-643a-4375-ace5-033a9418114a",
            avatarUrl: null,
            allowAddUser: false,
            allowRemove: false,
            allowUpdate: false,
            allowConfigureCredentials: false,
            allowAddInstance: true,
            externalId:
              "store_integration_3231f620-643a-4375-ace5-033a9418114a",
            __typename: "Customer",
          },
          role: {
            id: "Um9sZTpiNGFiODZiNy0yNjU0LTQyNzEtYjIwOS0zNjQ5YjljYzg2Yzg=",
            name: "Marketplace",
            __typename: "Role",
          },
          __typename: "User",
        },
      })
    )
  }),
]

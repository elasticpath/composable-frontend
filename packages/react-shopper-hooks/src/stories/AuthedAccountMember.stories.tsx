import { Meta } from "@storybook/react"
import React from "react"

import Layout from "./components/Layout"
import { useAuthedAccountMember } from "../account/hooks/use-authed-account-member"
import { AccountProvider } from "../account"

const AuthedAccountMember = ({
  showHookData,
  id,
}: {
  showHookData: boolean
  id: string
}) => {
  const data = useAuthedAccountMember()
  return (
    <Layout showHookData={showHookData} data={data}>
      <h3>Account Member: {id}</h3>
      <p>{data?.data?.name}</p>
    </Layout>
  )
}

const meta: Meta = {
  title: "AuthedAccountMember",
  argTypes: {
    showHookData: {
      name: "Show hook data",
      description:
        "Whether or not story should display JSON of data returned from hook",
      control: {
        type: "boolean",
      },
      defaultValue: true,
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

export const GetOne = (args: { showHookData: boolean; id: string }) => (
  <AccountProvider>
    <AuthedAccountMember {...args} />
  </AccountProvider>
)

GetOne.argTypes = {
  id: {
    control: {
      type: "text",
    },
    name: "account member id",
    defaultValue: "0cfcf0de-dd4f-4bb6-acc8-099e1c0f5e0c",
  },
}

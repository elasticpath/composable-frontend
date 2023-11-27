import { Meta } from "@storybook/react"
import React from "react"

import Layout from "./components/Layout"
import { useAccountMember } from "../account"

const AccountMember = ({
  showHookData,
  id,
}: {
  showHookData: boolean
  id: string
}) => {
  const { data, isLoading } = useAccountMember(id, {
    ep: {
      accountMemberToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X21lbWJlcl9zZWxmX21hbmFnZW1lbnQiOiJ1cGRhdGVfb25seSIsImFuY2VzdG9ycyI6IiIsImV4cCI6MTcwMDgzNTkwNSwiaWF0IjoxNzAwNzQ5NTA1LCJyZWFsbV9pZCI6IjYxZmM5MTQ4LWI2YTYtNGI5MS04NDEyLWFlNDM0MDE0M2Q4OCIsInNjb3BlIjoiNmY0ODkzMTQtZTY1NS00ZTk5LWFjNzAtYmRkMDU2NzQ2NGRkIiwic3RvcmVfaWQiOiI4NTZlZWFlNi00NWVhLTQ1M2YtYWI3NS1lNTNlODRiZjNjNjEiLCJzdWIiOiIwY2ZjZjBkZS1kZDRmLTRiYjYtYWNjOC0wOTllMWMwZjVlMGMifQ.EQ25Sd29GOzyJnOQ_ELT7IfxhBvj6V0zpZL1r_3ol3M",
    },
  }) // TODO add real token
  return (
    <Layout showHookData={showHookData} data={data}>
      <h3>Account Member: {id}</h3>
      <p>{data?.name}</p>
    </Layout>
  )
}

const meta: Meta = {
  title: "AccountMember",
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
  <AccountMember {...args} />
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

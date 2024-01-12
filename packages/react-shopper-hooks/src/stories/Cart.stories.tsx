import { Meta } from "@storybook/react"
import React from "react"

import Layout from "./components/Layout"
import { useGetCart } from "../cart/hooks/use-get-cart"
import { CartProvider, useCart } from "../cart"
import { CartItem } from "@moltin/sdk"

const Cart = ({ showHookData, id }: { showHookData: boolean; id: string }) => {
  const { data, isLoading } = useGetCart(id) // TODO add real token
  return (
    <Layout showHookData={showHookData} data={data}>
      <h3>Cart: {id}</h3>
      <p>{data?.id}</p>
    </Layout>
  )
}

const meta: Meta = {
  title: "Cart",
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
  <Cart {...args} />
)

GetOne.argTypes = {
  id: {
    control: {
      type: "text",
    },
    name: "cart id",
    defaultValue: "f0341e8e-4962-4245-9748-aaa84615c2f6",
  },
}

function Item({ item }: { item: CartItem }) {
  const { useScopedUpdateCartItem, useScopedRemoveCartItem } = useCart()
  const { mutate: mutateUpdate, isPending: isUpdateItemPending } =
    useScopedUpdateCartItem()
  const { mutate: mutateRemove, isPending: isRemovePending } =
    useScopedRemoveCartItem()
  return (
    <li key={item.id}>
      {item.name} - {item.quantity} -{" "}
      <button
        onClick={() =>
          mutateUpdate({
            itemId: item.id,
            quantity: item.quantity + 1,
          })
        }
      >
        +
      </button>
      <button
        onClick={() =>
          mutateUpdate({
            itemId: item.id,
            quantity: item.quantity - 1,
          })
        }
      >
        -
      </button>
      <button
        onClick={() =>
          mutateRemove({
            itemId: item.id,
          })
        }
      >
        Remove Cart Item
      </button>
      {isUpdateItemPending && <p>Updating...</p>}
      {isRemovePending && <p>Removing...</p>}
    </li>
  )
}

const CartUsingProvider = ({
  showHookData,
  id,
}: {
  showHookData: boolean
  id: string
}) => {
  const { state } = useCart()
  return (
    <Layout showHookData={showHookData}>
      <h3>Cart: {id}</h3>
      <ul>
        {(state as any)?.items?.map((item: CartItem) => {
          return <Item item={item} key={item.id} />
        })}
      </ul>
    </Layout>
  )
}

export const CartProv = (args: { showHookData: boolean; id: string }) => (
  <CartProvider cartId={args.id}>
    <CartUsingProvider {...args} />
  </CartProvider>
)

CartProv.argTypes = {
  id: {
    control: {
      type: "text",
    },
    name: "cart id",
    defaultValue: "f0341e8e-4962-4245-9748-aaa84615c2f6",
  },
}

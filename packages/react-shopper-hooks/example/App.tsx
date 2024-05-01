import React from "react"
import "./App.css"
import CartExample from "./CartExample"
import { CartProvider } from "../src/cart"
import { gateway as EPCCGateway } from "@moltin/sdk"
import { StoreProvider } from "../src/store"

function App() {
  const client = EPCCGateway({
    name: "my_store",
    client_id: import.meta.env.VITE_APP_EPCC_CLIENT_ID,
    client_secret: import.meta.env.VITE_APP_EPCC_CLIENT_SECRET,
    host: import.meta.env.VITE_APP_EPCC_HOST,
  })

  return (
    <div className="App">
      <h1>React Shopper Hooks</h1>
      <div className="card">
        <StoreProvider cartId={client.Cart().cartId}>
          <CartProvider cartId={client.Cart().cartId}>
            <CartExample />
          </CartProvider>
        </StoreProvider>
      </div>
    </div>
  )
}

export default App

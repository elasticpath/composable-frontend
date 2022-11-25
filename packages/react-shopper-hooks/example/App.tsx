import React, { useState } from "react"
import "./App.css"
import CartExample from "./CartExample"
import { CartProvider } from "@lib/cart"
import { gateway as EPCCGateway } from "@moltin/sdk"

function App() {
  const [count, setCount] = useState(0)

  const client = EPCCGateway({
    name: "my_store",
    client_id: import.meta.env.VITE_APP_EPCC_CLIENT_ID,
    client_secret: import.meta.env.VITE_APP_EPCC_CLIENT_SECRET,
    host: import.meta.env.VITE_APP_EPCC_HOST
  })

  return (
    <div className="App">
      <h1>EPCC React</h1>
      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <CartProvider client={client} resolveCartId={() => client.Cart().cartId}>
        <CartExample />
      </CartProvider>
    </div>
  )
}

export default App

import React from "react"
import "./App.css"
import CartExample from "./CartExample"
import { gateway as EPCCGateway } from "@elasticpath/js-sdk"
import { StoreProvider } from "../src/store"
import { ElasticPathProvider } from "../src"
import { QueryClient } from "@tanstack/react-query"
import { ProductListExample } from "./ProductListExample"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const client = EPCCGateway({
  name: "my_store",
  client_id: import.meta.env.VITE_APP_EPCC_CLIENT_ID,
  client_secret: import.meta.env.VITE_APP_EPCC_CLIENT_SECRET,
  host: import.meta.env.VITE_APP_EPCC_HOST,
})

const queryClient = new QueryClient()

function App() {
  const [activeItem, setActiveItem] = React.useState<"cart" | "products">(
    "cart",
  )

  return (
    <div className="App">
      <h1>React Shopper Hooks</h1>
      <div>
        <button onClick={() => setActiveItem("cart")}>Cart View</button>
        <button onClick={() => setActiveItem("products")}>Products View</button>
      </div>
      <div className="card">
        <ElasticPathProvider
          client={client}
          queryClientProviderProps={{ client: queryClient }}
        >
          <ReactQueryDevtools initialIsOpen={false} />
          <StoreProvider>
            {activeItem === "cart" && <CartExample />}
            {activeItem === "products" && <ProductListExample />}
          </StoreProvider>
        </ElasticPathProvider>
      </div>
    </div>
  )
}

function TanstackWrapper() {}

export default App

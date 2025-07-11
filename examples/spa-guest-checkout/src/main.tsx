import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { StorefrontProvider } from "./auth/StorefrontProvider.tsx"
import { CartProvider } from "./auth/CartProvider.tsx"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StorefrontProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </StorefrontProvider>
  </React.StrictMode>,
)

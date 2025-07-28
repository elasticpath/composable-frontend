import { client } from "@epcc-sdk/sdks-shopper"
import { configureClient } from "@/lib/client"

// Configure once when the module loads
configureClient()

export { client }

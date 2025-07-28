import { client } from "@epcc-sdk/sdks-shopper"
import { configureClient } from "@/lib/client"

// Configure once when module loads
configureClient()

export { client }

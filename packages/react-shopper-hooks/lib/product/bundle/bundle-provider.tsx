import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react"
import type {
  BundleComponents,
  BundleConfiguration,
  BundleConfigurationSelectedOptions,
  ComponentProduct,
} from "@lib/product/bundle/bundle.types"
import type { Moltin as EpccClient, ProductResponse } from "@moltin/sdk"
import { createBundleConfigureValidator } from "@lib/product/bundle/util/create-bundle-configure-validator"
import { BundleProduct } from "@lib/product"

interface BundleProductState {
  configuredProduct: BundleProduct
  setConfiguredProduct: Dispatch<SetStateAction<BundleProduct>>
  components: BundleComponents
  setComponents: Dispatch<SetStateAction<BundleComponents>>
  componentProducts: ProductResponse[]
  setComponentProducts: Dispatch<SetStateAction<ComponentProduct[]>>
  bundleConfiguration: BundleConfiguration
  setBundleConfiguration: Dispatch<SetStateAction<BundleConfiguration>>
  selectedOptions: BundleConfigurationSelectedOptions
  setSelectedOptions: Dispatch<
    SetStateAction<BundleConfigurationSelectedOptions>
  >
  client: EpccClient
}

export const BundleProductContext = createContext<BundleProductState | null>(
  null
)

export function BundleProductProvider({
  children,
  bundleProduct,
  client,
}: {
  bundleProduct: BundleProduct
  children: ReactNode
  client: EpccClient
}) {
  const [configuredProduct, setConfiguredProduct] =
    useState<BundleProduct>(bundleProduct)

  const {
    componentProductResponses,
    response: {
      attributes: { components: srcComponents },
      meta: { bundle_configuration: initBundleConfiguration },
    },
  } = configuredProduct

  if (!initBundleConfiguration) {
    throw new Error(
      "bundle_configuration on bundle product was unexpectedly undefined!"
    )
  }

  const [components, setComponents] = useState<BundleComponents>(srcComponents)
  const [bundleConfiguration, setBundleConfiguration] =
    useState<BundleConfiguration>(initBundleConfiguration)
  const [componentProducts, setComponentProducts] = useState<
    ComponentProduct[]
  >(componentProductResponses)

  const validator = useCallback(createBundleConfigureValidator(srcComponents), [
    components,
  ])

  const [selectedOptions, setSelectedOptions] =
    useState<BundleConfigurationSelectedOptions>(
      initBundleConfiguration.selected_options
    )

  const configureBundle = useCallback(
    async (selectedOptions: BundleConfigurationSelectedOptions) => {
      const { success: isValid } = validator(selectedOptions)

      if (isValid) {
        const updatedBundleProduct = await _configureBundle(
          client,
          configuredProduct.response.id,
          selectedOptions
        )
        setConfiguredProduct((prevState) => ({
          ...prevState,
          response: updatedBundleProduct,
        }))
      }
    },
    [configuredProduct, setConfiguredProduct, validator]
  )

  // Sync the configured product details when selected options change
  useEffect(() => {
    configureBundle(selectedOptions)
  }, [selectedOptions])

  return (
    <BundleProductContext.Provider
      value={{
        client,
        configuredProduct,
        setConfiguredProduct,
        components,
        setComponents,
        bundleConfiguration,
        setBundleConfiguration,
        componentProducts,
        setComponentProducts,
        selectedOptions,
        setSelectedOptions,
      }}
    >
      {children}
    </BundleProductContext.Provider>
  )
}

// TODO add configure endpoint to ShopperCatalog.Products section of sdk.
async function _configureBundle(
  client: EpccClient,
  productId: string,
  selectedOptions: BundleConfigurationSelectedOptions
): Promise<BundleProduct["response"]> {
  // TODO add configure endpoint to ShopperCatalog.Products section of sdk.
  const host = client.config.host
  const credentials = client.credentials()

  if (!credentials?.access_token) {
    throw new Error(
      "Failed to configure bundle as the credentials access token was undefined!"
    )
  }

  const response = await fetch(
    `https://${host}/catalog/products/${productId}/configure`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials?.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          selected_options: selectedOptions,
        },
      }),
    }
  ).then((resp) => resp.json())

  return response.data as BundleProduct["response"]
}

// This file is auto-generated by @hey-api/openapi-ts

import type {
  GetByContextReleaseResponse,
  GetByContextAllHierarchiesResponse,
  GetByContextHierarchyResponse,
  GetByContextHierarchyNodesResponse,
  GetByContextHierarchyChildNodesResponse,
  GetByContextAllNodesResponse,
  GetByContextNodeResponse,
  GetByContextChildNodesResponse,
  GetByContextAllProductsResponse,
  GetByContextProductResponse,
  GetByContextComponentProductIdsResponse,
  GetByContextChildProductsResponse,
  GetByContextProductsForHierarchyResponse,
  GetByContextProductsForNodeResponse,
  ConfigureByContextProductResponse,
  GetCatalogsResponse,
  CreateCatalogResponse,
  GetCatalogByIdResponse,
  UpdateCatalogResponse,
  GetReleasesResponse,
  PublishReleaseResponse,
  GetReleaseByIdResponse,
  GetRulesResponse,
  CreateRuleResponse,
  GetRuleByIdResponse,
  UpdateRuleResponse,
  GetAllHierarchiesResponse,
  GetHierarchyResponse,
  GetHierarchyNodesResponse,
  GetHierarchyChildNodesResponse,
  GetAllNodesResponse,
  GetNodeResponse,
  GetChildNodesResponse,
  GetAllProductsResponse,
  GetProductResponse,
  GetComponentProductIdsResponse,
  GetChildProductsResponse,
  GetProductsForHierarchyResponse,
  GetProductsForNodeResponse,
  GetSubscriptionProductResponse,
  ListOfferingsResponse,
  GetOfferingResponse,
  ListOfferingProductsResponse,
  ListSubscriptionsResponse,
  GetSubscriptionResponse,
  ListSubscriptionProductsResponse,
  ListSubscriptionInvoicesResponse,
  ListSubscriptionInvoicePaymentsResponse,
  GetSubscriptionInvoicePaymentResponse,
  GetSubscriptionInvoiceResponse,
  ListInvoicesResponse,
  GetInvoiceResponse,
  GetStockResponse,
  PutV2AccountsAccountIdResponse,
  PostV2AccountMembersTokensResponse,
} from "./types.gen"

const releaseMetaSchemaResponseTransformer = (data: any) => {
  if (data.created_at) {
    data.created_at = new Date(data.created_at)
  }
  if (data.started_at) {
    data.started_at = new Date(data.started_at)
  }
  if (data.updated_at) {
    data.updated_at = new Date(data.updated_at)
  }
  if (data.total_products) {
    data.total_products = BigInt(data.total_products.toString())
  }
  if (data.total_nodes) {
    data.total_nodes = BigInt(data.total_nodes.toString())
  }
  return data
}

const releaseSchemaResponseTransformer = (data: any) => {
  if (data.attributes) {
    if (data.attributes.published_at) {
      data.attributes.published_at = new Date(data.attributes.published_at)
    }
    return data.attributes
  }
  if (data.meta) {
    data.meta = releaseMetaSchemaResponseTransformer(data.meta)
  }
  return data
}

const releaseDataSchemaResponseTransformer = (data: any) => {
  if (data.data) {
    data.data = releaseSchemaResponseTransformer(data.data)
  }
  return data
}

export const getByContextReleaseResponseTransformer = async (
  data: any,
): Promise<GetByContextReleaseResponse> => {
  data = releaseDataSchemaResponseTransformer(data)
  return data
}

const pageMetaSchemaResponseTransformer = (data: any) => {
  if (data.results) {
    if (data.results.total) {
      data.results.total = BigInt(data.results.total.toString())
    }
    return data.results
  }
  if (data.page) {
    if (data.page.limit) {
      data.page.limit = BigInt(data.page.limit.toString())
    }
    if (data.page.offset) {
      data.page.offset = BigInt(data.page.offset.toString())
    }
    if (data.page.current) {
      data.page.current = BigInt(data.page.current.toString())
    }
    if (data.page.total) {
      data.page.total = BigInt(data.page.total.toString())
    }
    return data.page
  }
  return data
}

const hierarchyAttributesSchemaResponseTransformer = (data: any) => {
  if (data.created_at) {
    data.created_at = new Date(data.created_at)
  }
  if (data.published_at) {
    data.published_at = new Date(data.published_at)
  }
  if (data.updated_at) {
    data.updated_at = new Date(data.updated_at)
  }
  return data
}

const hierarchySchemaResponseTransformer = (data: any) => {
  if (data.attributes) {
    data.attributes = hierarchyAttributesSchemaResponseTransformer(
      data.attributes,
    )
  }
  return data
}

const hierarchyListDataSchemaResponseTransformer = (data: any) => {
  if (data.meta) {
    data.meta = pageMetaSchemaResponseTransformer(data.meta)
  }
  if (data.data) {
    data.data = data.data.map((item: any) => {
      return hierarchySchemaResponseTransformer(item)
    })
  }
  return data
}

export const getByContextAllHierarchiesResponseTransformer = async (
  data: any,
): Promise<GetByContextAllHierarchiesResponse> => {
  data = hierarchyListDataSchemaResponseTransformer(data)
  return data
}

const hierarchyDataSchemaResponseTransformer = (data: any) => {
  if (data.data) {
    data.data = hierarchySchemaResponseTransformer(data.data)
  }
  return data
}

export const getByContextHierarchyResponseTransformer = async (
  data: any,
): Promise<GetByContextHierarchyResponse> => {
  data = hierarchyDataSchemaResponseTransformer(data)
  return data
}

const nodeAttributesSchemaResponseTransformer = (data: any) => {
  if (data.created_at) {
    data.created_at = new Date(data.created_at)
  }
  if (data.published_at) {
    data.published_at = new Date(data.published_at)
  }
  if (data.updated_at) {
    data.updated_at = new Date(data.updated_at)
  }
  return data
}

const nodeSchemaResponseTransformer = (data: any) => {
  if (data.attributes) {
    data.attributes = nodeAttributesSchemaResponseTransformer(data.attributes)
  }
  return data
}

const nodeListDataSchemaResponseTransformer = (data: any) => {
  if (data.meta) {
    data.meta = pageMetaSchemaResponseTransformer(data.meta)
  }
  if (data.data) {
    data.data = data.data.map((item: any) => {
      return nodeSchemaResponseTransformer(item)
    })
  }
  return data
}

export const getByContextHierarchyNodesResponseTransformer = async (
  data: any,
): Promise<GetByContextHierarchyNodesResponse> => {
  data = nodeListDataSchemaResponseTransformer(data)
  return data
}

export const getByContextHierarchyChildNodesResponseTransformer = async (
  data: any,
): Promise<GetByContextHierarchyChildNodesResponse> => {
  data = nodeListDataSchemaResponseTransformer(data)
  return data
}

export const getByContextAllNodesResponseTransformer = async (
  data: any,
): Promise<GetByContextAllNodesResponse> => {
  data = nodeListDataSchemaResponseTransformer(data)
  return data
}

const nodeDataSchemaResponseTransformer = (data: any) => {
  if (data.data) {
    data.data = nodeSchemaResponseTransformer(data.data)
  }
  return data
}

export const getByContextNodeResponseTransformer = async (
  data: any,
): Promise<GetByContextNodeResponse> => {
  data = nodeDataSchemaResponseTransformer(data)
  return data
}

export const getByContextChildNodesResponseTransformer = async (
  data: any,
): Promise<GetByContextChildNodesResponse> => {
  data = nodeListDataSchemaResponseTransformer(data)
  return data
}

const productAttributesSchemaResponseTransformer = (data: any) => {
  if (data.published_at) {
    data.published_at = new Date(data.published_at)
  }
  if (data.created_at) {
    data.created_at = new Date(data.created_at)
  }
  if (data.updated_at) {
    data.updated_at = new Date(data.updated_at)
  }
  return data
}

const fileReferenceSchemaResponseTransformer = (data: any) => {
  if (data.created_at) {
    data.created_at = new Date(data.created_at)
  }
  return data
}

const filesRelationshipSchemaResponseTransformer = (data: any) => {
  if (data.data) {
    data.data = data.data.map((item: any) => {
      return fileReferenceSchemaResponseTransformer(item)
    })
  }
  return data
}

const productRelationshipsSchemaResponseTransformer = (data: any) => {
  if (data.files) {
    data.files = filesRelationshipSchemaResponseTransformer(data.files)
  }
  return data
}

const productMetaSchemaResponseTransformer = (data: any) => {
  if (data.sale_expires) {
    data.sale_expires = new Date(data.sale_expires)
  }
  return data
}

const productSchemaResponseTransformer = (data: any) => {
  if (data.attributes) {
    data.attributes = productAttributesSchemaResponseTransformer(
      data.attributes,
    )
  }
  if (data.relationships) {
    data.relationships = productRelationshipsSchemaResponseTransformer(
      data.relationships,
    )
  }
  if (data.meta) {
    data.meta = productMetaSchemaResponseTransformer(data.meta)
  }
  return data
}

const includedSchemaResponseTransformer = (data: any) => {
  if (data.component_products) {
    data.component_products = data.component_products.map((item: any) => {
      return productSchemaResponseTransformer(item)
    })
  }
  return data
}

const productListDataSchemaResponseTransformer = (data: any) => {
  if (data.meta) {
    data.meta = pageMetaSchemaResponseTransformer(data.meta)
  }
  if (data.data) {
    data.data = data.data.map((item: any) => {
      return productSchemaResponseTransformer(item)
    })
  }
  if (data.included) {
    data.included = includedSchemaResponseTransformer(data.included)
  }
  return data
}

export const getByContextAllProductsResponseTransformer = async (
  data: any,
): Promise<GetByContextAllProductsResponse> => {
  data = productListDataSchemaResponseTransformer(data)
  return data
}

const productDataSchemaResponseTransformer = (data: any) => {
  if (data.data) {
    data.data = productSchemaResponseTransformer(data.data)
  }
  if (data.included) {
    data.included = includedSchemaResponseTransformer(data.included)
  }
  return data
}

export const getByContextProductResponseTransformer = async (
  data: any,
): Promise<GetByContextProductResponse> => {
  data = productDataSchemaResponseTransformer(data)
  return data
}

const productReferenceListDataSchemaResponseTransformer = (data: any) => {
  if (data.meta) {
    data.meta = pageMetaSchemaResponseTransformer(data.meta)
  }
  return data
}

export const getByContextComponentProductIdsResponseTransformer = async (
  data: any,
): Promise<GetByContextComponentProductIdsResponse> => {
  data = productReferenceListDataSchemaResponseTransformer(data)
  return data
}

export const getByContextChildProductsResponseTransformer = async (
  data: any,
): Promise<GetByContextChildProductsResponse> => {
  data = productListDataSchemaResponseTransformer(data)
  return data
}

export const getByContextProductsForHierarchyResponseTransformer = async (
  data: any,
): Promise<GetByContextProductsForHierarchyResponse> => {
  data = productListDataSchemaResponseTransformer(data)
  return data
}

export const getByContextProductsForNodeResponseTransformer = async (
  data: any,
): Promise<GetByContextProductsForNodeResponse> => {
  data = productListDataSchemaResponseTransformer(data)
  return data
}

export const configureByContextProductResponseTransformer = async (
  data: any,
): Promise<ConfigureByContextProductResponse> => {
  data = productDataSchemaResponseTransformer(data)
  return data
}

const catalogSchemaResponseTransformer = (data: any) => {
  data.attributes.created_at = new Date(data.attributes.created_at)
  data.attributes.updated_at = new Date(data.attributes.updated_at)
  return data.attributes
  return data
}

const catalogListDataSchemaResponseTransformer = (data: any) => {
  data.data = data.data.map((item: any) => {
    return catalogSchemaResponseTransformer(item)
  })
  return data
}

export const getCatalogsResponseTransformer = async (
  data: any,
): Promise<GetCatalogsResponse> => {
  data = catalogListDataSchemaResponseTransformer(data)
  return data
}

const catalogDataSchemaResponseTransformer = (data: any) => {
  data.data = catalogSchemaResponseTransformer(data.data)
  return data
}

export const createCatalogResponseTransformer = async (
  data: any,
): Promise<CreateCatalogResponse> => {
  data = catalogDataSchemaResponseTransformer(data)
  return data
}

export const getCatalogByIdResponseTransformer = async (
  data: any,
): Promise<GetCatalogByIdResponse> => {
  data = catalogDataSchemaResponseTransformer(data)
  return data
}

export const updateCatalogResponseTransformer = async (
  data: any,
): Promise<UpdateCatalogResponse> => {
  data = catalogDataSchemaResponseTransformer(data)
  return data
}

const releaseListDataSchemaResponseTransformer = (data: any) => {
  if (data.data) {
    data.data = data.data.map((item: any) => {
      return releaseSchemaResponseTransformer(item)
    })
  }
  return data
}

export const getReleasesResponseTransformer = async (
  data: any,
): Promise<GetReleasesResponse> => {
  data = releaseListDataSchemaResponseTransformer(data)
  return data
}

export const publishReleaseResponseTransformer = async (
  data: any,
): Promise<PublishReleaseResponse> => {
  data = releaseDataSchemaResponseTransformer(data)
  return data
}

export const getReleaseByIdResponseTransformer = async (
  data: any,
): Promise<GetReleaseByIdResponse> => {
  data = releaseDataSchemaResponseTransformer(data)
  return data
}

const ruleScheduleSchemaResponseTransformer = (data: any) => {
  if (data.valid_from) {
    data.valid_from = new Date(data.valid_from)
  }
  if (data.valid_to) {
    data.valid_to = new Date(data.valid_to)
  }
  return data
}

const ruleSchemaResponseTransformer = (data: any) => {
  if (data.attributes.schedules) {
    data.attributes.schedules = data.attributes.schedules.map((item: any) => {
      return ruleScheduleSchemaResponseTransformer(item)
    })
  }
  data.attributes.created_at = new Date(data.attributes.created_at)
  data.attributes.updated_at = new Date(data.attributes.updated_at)
  return data.attributes
  return data
}

const ruleListDataSchemaResponseTransformer = (data: any) => {
  if (data.meta) {
    data.meta = pageMetaSchemaResponseTransformer(data.meta)
  }
  data.data = data.data.map((item: any) => {
    return ruleSchemaResponseTransformer(item)
  })
  return data
}

export const getRulesResponseTransformer = async (
  data: any,
): Promise<GetRulesResponse> => {
  data = ruleListDataSchemaResponseTransformer(data)
  return data
}

const ruleDataSchemaResponseTransformer = (data: any) => {
  data.data = ruleSchemaResponseTransformer(data.data)
  return data
}

export const createRuleResponseTransformer = async (
  data: any,
): Promise<CreateRuleResponse> => {
  data = ruleDataSchemaResponseTransformer(data)
  return data
}

export const getRuleByIdResponseTransformer = async (
  data: any,
): Promise<GetRuleByIdResponse> => {
  data = ruleDataSchemaResponseTransformer(data)
  return data
}

export const updateRuleResponseTransformer = async (
  data: any,
): Promise<UpdateRuleResponse> => {
  data = ruleDataSchemaResponseTransformer(data)
  return data
}

export const getAllHierarchiesResponseTransformer = async (
  data: any,
): Promise<GetAllHierarchiesResponse> => {
  data = hierarchyListDataSchemaResponseTransformer(data)
  return data
}

export const getHierarchyResponseTransformer = async (
  data: any,
): Promise<GetHierarchyResponse> => {
  data = hierarchyDataSchemaResponseTransformer(data)
  return data
}

export const getHierarchyNodesResponseTransformer = async (
  data: any,
): Promise<GetHierarchyNodesResponse> => {
  data = nodeListDataSchemaResponseTransformer(data)
  return data
}

export const getHierarchyChildNodesResponseTransformer = async (
  data: any,
): Promise<GetHierarchyChildNodesResponse> => {
  data = nodeListDataSchemaResponseTransformer(data)
  return data
}

export const getAllNodesResponseTransformer = async (
  data: any,
): Promise<GetAllNodesResponse> => {
  data = nodeListDataSchemaResponseTransformer(data)
  return data
}

export const getNodeResponseTransformer = async (
  data: any,
): Promise<GetNodeResponse> => {
  data = nodeDataSchemaResponseTransformer(data)
  return data
}

export const getChildNodesResponseTransformer = async (
  data: any,
): Promise<GetChildNodesResponse> => {
  data = nodeListDataSchemaResponseTransformer(data)
  return data
}

export const getAllProductsResponseTransformer = async (
  data: any,
): Promise<GetAllProductsResponse> => {
  data = productListDataSchemaResponseTransformer(data)
  return data
}

export const getProductResponseTransformer = async (
  data: any,
): Promise<GetProductResponse> => {
  data = productDataSchemaResponseTransformer(data)
  return data
}

export const getComponentProductIdsResponseTransformer = async (
  data: any,
): Promise<GetComponentProductIdsResponse> => {
  data = productReferenceListDataSchemaResponseTransformer(data)
  return data
}

export const getChildProductsResponseTransformer = async (
  data: any,
): Promise<GetChildProductsResponse> => {
  data = productListDataSchemaResponseTransformer(data)
  return data
}

export const getProductsForHierarchyResponseTransformer = async (
  data: any,
): Promise<GetProductsForHierarchyResponse> => {
  data = productListDataSchemaResponseTransformer(data)
  return data
}

export const getProductsForNodeResponseTransformer = async (
  data: any,
): Promise<GetProductsForNodeResponse> => {
  data = productListDataSchemaResponseTransformer(data)
  return data
}

export const getSubscriptionProductResponseTransformer = async (
  data: any,
): Promise<GetSubscriptionProductResponse> => {
  if (data.data) {
    data.data = productSchemaResponseTransformer(data.data)
  }
  return data
}

const productResponseAttributesSchemaResponseTransformer = (data: any) => {
  data = productAttributesSchemaResponseTransformer(data)
  return data
}

const offeringProductResponseAttributesSchemaResponseTransformer = (
  data: any,
) => {
  data = productResponseAttributesSchemaResponseTransformer(data)
  return data
}

const offeringProductSchemaResponseTransformer = (data: any) => {
  data.attributes = offeringProductResponseAttributesSchemaResponseTransformer(
    data.attributes,
  )
  data.meta = productMetaSchemaResponseTransformer(data.meta)
  return data
}

const offeringIncludesSchemaResponseTransformer = (data: any) => {
  if (data.products) {
    data.products = data.products.map((item: any) => {
      return offeringProductSchemaResponseTransformer(item)
    })
  }
  return data
}

export const listOfferingsResponseTransformer = async (
  data: any,
): Promise<ListOfferingsResponse> => {
  if (data.included) {
    data.included = offeringIncludesSchemaResponseTransformer(data.included)
  }
  return data
}

export const getOfferingResponseTransformer = async (
  data: any,
): Promise<GetOfferingResponse> => {
  if (data.included) {
    data.included = offeringIncludesSchemaResponseTransformer(data.included)
  }
  return data
}

export const listOfferingProductsResponseTransformer = async (
  data: any,
): Promise<ListOfferingProductsResponse> => {
  if (data.data) {
    data.data = data.data.map((item: any) => {
      return offeringProductSchemaResponseTransformer(item)
    })
  }
  return data
}

const subscriptionIncludesSchemaResponseTransformer = (data: any) => {
  if (data.products) {
    data.products = data.products.map((item: any) => {
      return offeringProductSchemaResponseTransformer(item)
    })
  }
  return data
}

export const listSubscriptionsResponseTransformer = async (
  data: any,
): Promise<ListSubscriptionsResponse> => {
  if (data.included) {
    data.included = subscriptionIncludesSchemaResponseTransformer(data.included)
  }
  return data
}

export const getSubscriptionResponseTransformer = async (
  data: any,
): Promise<GetSubscriptionResponse> => {
  if (data.included) {
    data.included = subscriptionIncludesSchemaResponseTransformer(data.included)
  }
  return data
}

export const listSubscriptionProductsResponseTransformer = async (
  data: any,
): Promise<ListSubscriptionProductsResponse> => {
  if (data.data) {
    data.data = data.data.map((item: any) => {
      return offeringProductSchemaResponseTransformer(item)
    })
  }
  return data
}

const timePeriodSchemaResponseTransformer = (data: any) => {
  data.start = new Date(data.start)
  data.end = new Date(data.end)
  return data
}

const singleCurrencyPriceSchemaResponseTransformer = (data: any) => {
  data.amount = BigInt(data.amount.toString())
  return data
}

const subscriptionInvoiceItemSchemaResponseTransformer = (data: any) => {
  data.price = singleCurrencyPriceSchemaResponseTransformer(data.price)
  return data
}

const subscriptionInvoiceAttributesSchemaResponseTransformer = (data: any) => {
  data.billing_period = timePeriodSchemaResponseTransformer(data.billing_period)
  data.invoice_items = data.invoice_items.map((item: any) => {
    return subscriptionInvoiceItemSchemaResponseTransformer(item)
  })
  return data
}

const prorationEventSchemaResponseTransformer = (data: any) => {
  data.billing_cost_before_proration = BigInt(
    data.billing_cost_before_proration.toString(),
  )
  data.refunded_amount_for_unused_plan = BigInt(
    data.refunded_amount_for_unused_plan.toString(),
  )
  data.new_plan_cost = BigInt(data.new_plan_cost.toString())
  return data
}

const subscriptionInvoiceMetaSchemaResponseTransformer = (data: any) => {
  if (data.price) {
    data.price = singleCurrencyPriceSchemaResponseTransformer(data.price)
  }
  data.proration_events = data.proration_events.map((item: any) => {
    return prorationEventSchemaResponseTransformer(item)
  })
  return data
}

const subscriptionInvoiceSchemaResponseTransformer = (data: any) => {
  data.attributes = subscriptionInvoiceAttributesSchemaResponseTransformer(
    data.attributes,
  )
  data.meta = subscriptionInvoiceMetaSchemaResponseTransformer(data.meta)
  return data
}

export const listSubscriptionInvoicesResponseTransformer = async (
  data: any,
): Promise<ListSubscriptionInvoicesResponse> => {
  if (data.data) {
    data.data = data.data.map((item: any) => {
      return subscriptionInvoiceSchemaResponseTransformer(item)
    })
  }
  return data
}

const subscriptionInvoicePaymentAttributesSchemaResponseTransformer = (
  data: any,
) => {
  data.amount = singleCurrencyPriceSchemaResponseTransformer(data.amount)
  return data
}

const subscriptionInvoicePaymentSchemaResponseTransformer = (data: any) => {
  data.attributes =
    subscriptionInvoicePaymentAttributesSchemaResponseTransformer(
      data.attributes,
    )
  return data
}

export const listSubscriptionInvoicePaymentsResponseTransformer = async (
  data: any,
): Promise<ListSubscriptionInvoicePaymentsResponse> => {
  if (data.data) {
    data.data = data.data.map((item: any) => {
      return subscriptionInvoicePaymentSchemaResponseTransformer(item)
    })
  }
  return data
}

export const getSubscriptionInvoicePaymentResponseTransformer = async (
  data: any,
): Promise<GetSubscriptionInvoicePaymentResponse> => {
  if (data.data) {
    data.data = subscriptionInvoicePaymentSchemaResponseTransformer(data.data)
  }
  return data
}

export const getSubscriptionInvoiceResponseTransformer = async (
  data: any,
): Promise<GetSubscriptionInvoiceResponse> => {
  if (data.data) {
    data.data = subscriptionInvoiceSchemaResponseTransformer(data.data)
  }
  return data
}

export const listInvoicesResponseTransformer = async (
  data: any,
): Promise<ListInvoicesResponse> => {
  if (data.data) {
    data.data = data.data.map((item: any) => {
      return subscriptionInvoiceSchemaResponseTransformer(item)
    })
  }
  return data
}

export const getInvoiceResponseTransformer = async (
  data: any,
): Promise<GetInvoiceResponse> => {
  if (data.data) {
    data.data = subscriptionInvoiceSchemaResponseTransformer(data.data)
  }
  return data
}

const stockResponseAttributesSchemaResponseTransformer = (data: any) => {
  data.available = BigInt(data.available.toString())
  data.allocated = BigInt(data.allocated.toString())
  data.total = BigInt(data.total.toString())
  return data
}

const stockResponseSchemaResponseTransformer = (data: any) => {
  data.attributes = stockResponseAttributesSchemaResponseTransformer(
    data.attributes,
  )
  return data
}

export const getStockResponseTransformer = async (
  data: any,
): Promise<GetStockResponse> => {
  data.data = stockResponseSchemaResponseTransformer(data.data)
  return data
}

export const putV2AccountsAccountIdResponseTransformer = async (
  data: any,
): Promise<PutV2AccountsAccountIdResponse> => {
  if (data.data) {
    if (data.data.meta) {
      if (data.data.meta.timestamps) {
        if (data.data.meta.timestamps.created_at) {
          data.data.meta.timestamps.created_at = new Date(
            data.data.meta.timestamps.created_at,
          )
        }
        if (data.data.meta.timestamps.updated_at) {
          data.data.meta.timestamps.updated_at = new Date(
            data.data.meta.timestamps.updated_at,
          )
        }
        return data.data.meta.timestamps
      }
      return data.data.meta
    }
    return data.data
  }
  return data
}

const accountManagementAuthenticationTokenResponseSchemaResponseTransformer = (
  data: any,
) => {
  if (data.expires) {
    data.expires = new Date(data.expires)
  }
  return data
}

export const postV2AccountMembersTokensResponseTransformer = async (
  data: any,
): Promise<PostV2AccountMembersTokensResponse> => {
  if (data.data) {
    data.data = data.data.map((item: any) => {
      return accountManagementAuthenticationTokenResponseSchemaResponseTransformer(
        item,
      )
    })
  }
  return data
}

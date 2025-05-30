// This file is auto-generated by @hey-api/openapi-ts

import type {
  GetPricebooksResponse,
  CreatePricebookResponse,
  GetPricebookByIdResponse,
  UpdatePricebookResponse,
  ImportPricebookResponse,
  ReplicatePricebookResponse,
  GetProductPricesResponse,
  CreateProductPriceResponse,
  GetProductPriceByIdResponse,
  UpdateProductPriceResponse,
  GetPricesResponse,
  GetPriceModifiersResponse,
  CreatePriceModifierResponse,
  GetPriceModifierByIdResponse,
  UpdatePriceModifierResponse,
} from "./types.gen"

const pricebookSchemaResponseTransformer = (data: any) => {
  data.attributes.created_at = new Date(data.attributes.created_at)
  data.attributes.updated_at = new Date(data.attributes.updated_at)
  return data.attributes
  return data
}

const pricebookListDataSchemaResponseTransformer = (data: any) => {
  data.data = data.data.map((item: any) => {
    return pricebookSchemaResponseTransformer(item)
  })
  return data
}

export const getPricebooksResponseTransformer = async (
  data: any,
): Promise<GetPricebooksResponse> => {
  data = pricebookListDataSchemaResponseTransformer(data)
  return data
}

const pricebookDataSchemaResponseTransformer = (data: any) => {
  data.data = pricebookSchemaResponseTransformer(data.data)
  return data
}

export const createPricebookResponseTransformer = async (
  data: any,
): Promise<CreatePricebookResponse> => {
  data = pricebookDataSchemaResponseTransformer(data)
  return data
}

const productPriceSchemaResponseTransformer = (data: any) => {
  if (data.attributes.created_at) {
    data.attributes.created_at = new Date(data.attributes.created_at)
  }
  if (data.attributes.updated_at) {
    data.attributes.updated_at = new Date(data.attributes.updated_at)
  }
  return data.attributes
  return data
}

const pricebookWithPricesDataSchemaResponseTransformer = (data: any) => {
  data.data = pricebookSchemaResponseTransformer(data.data)
  if (data.included) {
    data.included = data.included.map((item: any) => {
      return productPriceSchemaResponseTransformer(item)
    })
  }
  return data
}

export const getPricebookByIdResponseTransformer = async (
  data: any,
): Promise<GetPricebookByIdResponse> => {
  data = pricebookWithPricesDataSchemaResponseTransformer(data)
  return data
}

export const updatePricebookResponseTransformer = async (
  data: any,
): Promise<UpdatePricebookResponse> => {
  data = pricebookDataSchemaResponseTransformer(data)
  return data
}

const jobSchemaResponseTransformer = (data: any) => {
  data.attributes.created_at = new Date(data.attributes.created_at)
  data.attributes.updated_at = new Date(data.attributes.updated_at)
  if (data.attributes.started_at) {
    data.attributes.started_at = new Date(data.attributes.started_at)
  }
  if (data.attributes.completed_at) {
    data.attributes.completed_at = new Date(data.attributes.completed_at)
  }
  return data.attributes
  return data
}

const jobDataSchemaResponseTransformer = (data: any) => {
  data.data = jobSchemaResponseTransformer(data.data)
  return data
}

export const importPricebookResponseTransformer = async (
  data: any,
): Promise<ImportPricebookResponse> => {
  data = jobDataSchemaResponseTransformer(data)
  return data
}

export const replicatePricebookResponseTransformer = async (
  data: any,
): Promise<ReplicatePricebookResponse> => {
  data = pricebookDataSchemaResponseTransformer(data)
  return data
}

const productPriceListDataSchemaResponseTransformer = (data: any) => {
  data.data = data.data.map((item: any) => {
    return productPriceSchemaResponseTransformer(item)
  })
  return data
}

export const getProductPricesResponseTransformer = async (
  data: any,
): Promise<GetProductPricesResponse> => {
  data = productPriceListDataSchemaResponseTransformer(data)
  return data
}

const productPriceDataSchemaResponseTransformer = (data: any) => {
  data.data = productPriceSchemaResponseTransformer(data.data)
  return data
}

export const createProductPriceResponseTransformer = async (
  data: any,
): Promise<CreateProductPriceResponse> => {
  data = productPriceDataSchemaResponseTransformer(data)
  return data
}

export const getProductPriceByIdResponseTransformer = async (
  data: any,
): Promise<GetProductPriceByIdResponse> => {
  data = productPriceDataSchemaResponseTransformer(data)
  return data
}

export const updateProductPriceResponseTransformer = async (
  data: any,
): Promise<UpdateProductPriceResponse> => {
  data = productPriceDataSchemaResponseTransformer(data)
  return data
}

const priceListDataSchemaResponseTransformer = (data: any) => {
  data.data = data.data.map((item: any) => {
    return productPriceSchemaResponseTransformer(item)
  })
  return data
}

export const getPricesResponseTransformer = async (
  data: any,
): Promise<GetPricesResponse> => {
  data = priceListDataSchemaResponseTransformer(data)
  return data
}

const priceModifierSchemaResponseTransformer = (data: any) => {
  if (data.attributes.created_at) {
    data.attributes.created_at = new Date(data.attributes.created_at)
  }
  if (data.attributes.updated_at) {
    data.attributes.updated_at = new Date(data.attributes.updated_at)
  }
  return data.attributes
  return data
}

const priceModifierListDataSchemaResponseTransformer = (data: any) => {
  data.data = data.data.map((item: any) => {
    return priceModifierSchemaResponseTransformer(item)
  })
  return data
}

export const getPriceModifiersResponseTransformer = async (
  data: any,
): Promise<GetPriceModifiersResponse> => {
  data = priceModifierListDataSchemaResponseTransformer(data)
  return data
}

const priceModifierDataSchemaResponseTransformer = (data: any) => {
  data.data = priceModifierSchemaResponseTransformer(data.data)
  return data
}

export const createPriceModifierResponseTransformer = async (
  data: any,
): Promise<CreatePriceModifierResponse> => {
  data = priceModifierDataSchemaResponseTransformer(data)
  return data
}

export const getPriceModifierByIdResponseTransformer = async (
  data: any,
): Promise<GetPriceModifierByIdResponse> => {
  data = priceModifierDataSchemaResponseTransformer(data)
  return data
}

export const updatePriceModifierResponseTransformer = async (
  data: any,
): Promise<UpdatePriceModifierResponse> => {
  data = priceModifierDataSchemaResponseTransformer(data)
  return data
}

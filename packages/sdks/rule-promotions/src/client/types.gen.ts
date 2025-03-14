// This file is auto-generated by @hey-api/openapi-ts

export type Type = "rule_promotion"

/**
 * Specifies the strategy for determining which items to discount based on their individual prices.
 */
export type PriceStrategy = "cheapest" | "expensive"

export type RulePromotionRequest = {
  data?: {
    type?: "rule_promotion"
    /**
     * Specifies a name for the promotion.
     */
    name?: string
    /**
     * Specifies a description for the rule promotion.
     */
    description?: string
    /**
     * Specifies the priority order of a promotion, with larger numbers indicating higher priorities.
     */
    priority?: number
    /**
     * Specifies whether the promotion is enabled. The options are true or false, and the default setting is false.
     */
    enabled?: boolean
    /**
     * Specifies whether the promotion is applied automatically to the cart or a code is required to apply the promotion. The default setting is false. When this value is set to true, a code is autogenerated. If this value is set to false, you must create the code manually.
     */
    automatic?: boolean
    /**
     * Specifies whether this promotion can stack with other promotions.
     */
    stackable?: boolean
    /**
     * Enables a promotion to be stacked with an otherwise non-stackable promotion.
     */
    override_stacking?: boolean
    /**
     * Specifies the start date and time of the promotion or the start date of the promotion. You can provide a specific time in the HH:MM format. If no time is specified, the default start and end time is set to 00:00.
     */
    start?: Date
    /**
     * Specifies the end date and time of the promotion or the end date of the promotion.
     */
    end?: Date
    rule_set?: {
      /**
       * Specifies the catalogs that are eligible for the promotion. By default, the promotion applies to all items, including custom items. However, when catalog_ids is defined, the promotion is only applied to items within the specified catalogs. If catalog IDs are specified, custom items cannot be applied as part of the promotion.
       */
      catalog_ids?: Array<string>
      /**
       * Specifies currencies that are applied for the promotion.
       */
      currencies?: Array<string>
      rules?: {
        /**
         * Specifies a given strategy for the rule. Strategies determine how rules are applied. Supported strategies value include `cart_total`, `cart_custom_attribute`, `item_price`, `item_sku`, `item_product_id`, `item_quantity`, `item_category`, `item_attribute`, `item_identifier`, `and` and `or`.
         */
        strategy?: string
        /**
         * Specifies the operators used for the rule strategy.
         */
        operator?: string
        /**
         * Represents the condition value associated with each rule within the rule set. It requires at least three arguments.
         */
        args?: Array<string>
        children?: Array<{
          strategy?: string
          operator?: string
          args?: Array<string>
        }>
      }
      actions?: Array<{
        /**
         * Specifies the strategy for the promotion action.
         */
        strategy?: string
        args?: Array<string>
        condition?: {
          strategy?: string
          children?: Array<{
            strategy?: string
            operator?: string
            args?: Array<string>
          }>
        }
        limitations?: {
          /**
           * Specifies the maximum amount of discount applied to the shopping cart.
           */
          max_discount?: number
          /**
           * Specifies the maximum quantity of each eligible item to which the promotion is applied.
           */
          max_quantity?: number
          items?: {
            /**
             * Specifies the maximum number of items eligible for the discount.
             */
            max_items?: number
            /**
             * Specifies the strategy for determining which items to discount based on their individual prices.
             */
            price_strategy?: "cheapest" | "expensive"
          }
        }
      }>
    }
  }
}

export type RulePromotionResponse = {
  data?: {
    type?: "rule_promotion"
    id?: string
    store_id?: string
    name?: string
    description?: string
    priority?: number
    enabled?: boolean
    automatic?: boolean
    stackable?: boolean
    override_stacking?: boolean
    rule_set?: {
      catalog_ids?: Array<string>
      currencies?: Array<string>
      rules?: {
        strategy?: string
        operator?: string
        args?: Array<string>
        children?: Array<{
          strategy?: string
          operator?: string
          args?: Array<string>
        }>
      }
      actions?: Array<{
        strategy?: string
        args?: Array<string>
        condition?: {
          strategy?: string
          children?: Array<{
            strategy?: string
            operator?: string
            args?: Array<string>
          }>
        }
        limitations?: {
          max_discount?: number
          max_quantity?: number
          items?: {
            max_items?: number
            price_strategy?: "cheapest" | "expensive"
          }
        }
      }>
    }
    start?: Date
    end?: Date
    meta?: {
      timestamps?: {
        created_at?: Date
        updated_at?: Date
      }
    }
  }
}

/**
 * Object for setting max uses per shopper. Only include this object, when you want to set limit per shopper.
 */
export type MaxUsesPerShopper = {
  /**
   * Sets max number of times the code can be used by a shopper. NOTE - This cannot be set with `per_application` consume unit.
   */
  max_uses?: number
  /**
   * The flag to include guest shoppers for the discount with max use restriction. **If this field is provided, the max_uses value is required.** When set to `true`, guest shoppers must have an email associated with the cart to use the code. A guest cart without an email cannot use the code. When set to `false`, guest shoppers cannot use the promo code, even if the cart has an associated guest email.
   */
  includes_guests?: boolean
}

/**
 * Specifies whether the code is consumed per application or per checkout. With `per_checkout`, the code is used once for each checkout, regardless of the number of items in the cart. When set to `per_application`, the code is used per application. For cart discounts, each application counts as one usage. For item discounts, each application to either a single quantity or a bundle is counted as one usage. For example, in a store that offers 50% off on SKU1, SKU2, and SKU3, and limits the maximum usage of the promotion code to two, a shopper can apply the promotion up to two quantities. If the cart contains two or more quantities of SKU1, the promotion is applied 2 times to SKU1, and other quantities and items are at the regular price. If the cart contains one quantity of SKU1, one quantity of SKU2, and one quantity of SKU3, the promotion is applied once to SKU1 and once to SKU2. The code usage is applied at checkout and the code is considered consumed at that point.
 *
 */
export type ConsumeUnit = "per_application" | "per_checkout"

export type PromotionCodesRequest = {
  data?: {
    type?: "promotion_codes"
    /**
     * Specifies the code details in an array of objects.
     */
    codes?: Array<{
      /**
       * Specifies the string to use as a code for the promotion.
       */
      code?: string
      /**
       * Specifies the number of times the code can be used. If no value is set, the customer can use the code any number of times.
       */
      uses?: number
      /**
       * Specifies the customer ID of the shopper who can use the code. For more information, see the [Create a customer](/docs/customer-management/customer-management-api/create-a-customer) section.
       */
      user?: string
      /**
       * Specifies whether the code is consumed per application or per checkout. With `per_checkout`, the code is used once for each checkout, regardless of the number of items in the cart. When set to `per_application`, the code is used per application. For cart discounts, each application counts as one usage. For item discounts, each application to either a single quantity or a bundle is counted as one usage. For example, in a store that offers 50% off on SKU1, SKU2, and SKU3, and limits the maximum usage of the promotion code to two, a shopper can apply the promotion up to two quantities. If the cart contains two or more quantities of SKU1, the promotion is applied 2 times to SKU1, and other quantities and items are at the regular price. If the cart contains one quantity of SKU1, one quantity of SKU2, and one quantity of SKU3, the promotion is applied once to SKU1 and once to SKU2. The code usage is applied at checkout and the code is considered consumed at that point.
       *
       */
      consume_unit?: "per_application" | "per_checkout"
      max_users_per_shopper?: MaxUsesPerShopper
      /**
       * A flag indicating whether the coupon is for first-time shoppers. If set to `true`, the discount will only apply if the shopper has never made a payment on any order in the store. If set to `false` or left unset, it will be a regular discount that applies to all shoppers. When this flag is set to `true`, the coupon cannot have usage limitations or be assigned to specific users.
       */
      is_for_new_shopper?: boolean
    }>
  }
}

export type GetPromotionCodeResponse = {
  type?: "promotion_codes"
  code?: string
  uses?: number
  user?: string
  /**
   * Specifies whether the code is consumed per application or per checkout. With `per_checkout`, the code is used once for each checkout, regardless of the number of items in the cart. When set to `per_application`, the code is used per application. For cart discounts, each application counts as one usage. For item discounts, each application to either a single quantity or a bundle is counted as one usage. For example, in a store that offers 50% off on SKU1, SKU2, and SKU3, and limits the maximum usage of the promotion code to two, a shopper can apply the promotion up to two quantities. If the cart contains two or more quantities of SKU1, the promotion is applied 2 times to SKU1, and other quantities and items are at the regular price. If the cart contains one quantity of SKU1, one quantity of SKU2, and one quantity of SKU3, the promotion is applied once to SKU1 and once to SKU2. The code usage is applied at checkout and the code is considered consumed at that point.
   *
   */
  consume_unit?: "per_application" | "per_checkout"
  max_uses?: number
  max_users_per_shopper?: MaxUsesPerShopper
  is_for_new_shopper?: boolean
  created_by?: string
  meta?: {
    timestamps?: {
      created_at?: Date
    }
  }
}

export type CreatePromotionCodeResponse = {
  type?: "promotion_codes"
  code?: string
  uses?: number
  user?: string
  consume_unit?: "per_application" | "per_checkout"
  max_uses?: number
  max_users_per_shopper?: MaxUsesPerShopper
  is_for_new_shopper?: boolean
}

export type GetPromotionCodesResponse = {
  data?: Array<GetPromotionCodeResponse>
}

export type CreatePromotionCodesResponse = {
  data?: Array<CreatePromotionCodeResponse>
  messages?: Array<PromotionCodeMessage>
}

/**
 * Represents the result of a promotion job, including the number of generated and deleted promotion codes.
 *
 * - `generated`: Total number of successfully generated codes.
 * - `deleted`: Number of codes that were deleted during job cancellation, if applicable.
 *
 */
export type GenerateResult = {
  /**
   * Number of successfully generated promotion codes.
   */
  generated?: number
  /**
   * Number of codes deleted due to job cancellation.
   */
  deleted?: number
}

export type PromotionJob = {
  /**
   * A unique ID generated when a job is created.
   */
  id?: string
  /**
   * Always `promotion_job`.
   */
  type?: "promotion_job"
  /**
   * A unique ID of a promotion.
   */
  rule_promotion_id?: string
  /**
   * The type of job you want to run. For example, `code_generate` to generate codes or `code_export` to export codes.
   */
  job_type?: string
  /**
   * The name of the job. The maximum length allowed is 50 characters.
   */
  name?: string
  parameters?: {
    [key: string]: unknown
  }
  /**
   * The status of the job. Please see [Overview](/docs/api/promotions/promotion-jobs).
   */
  status?: string
  /**
   * The error encountered during job execution, if applicable.
   */
  error?: string
  meta?: {
    timestamps?: {
      /**
       * The creation date of the job.
       */
      created_at?: Date
      /**
       * The last updated date of the job.
       */
      updated_at?: Date
    }
  }
  generate_result?: GenerateResult
}

/**
 * Successful response
 */
export type PromotionJobsListResponse = unknown

/**
 * Promotion job created
 */
export type PromotionJobCreatedResponse = unknown

/**
 * Job canceled successfully
 */
export type PromotionJobCanceledResponse = unknown

/**
 * Successful response
 */
export type PromotionCodeExportedFileResponse = unknown

/**
 * Represents a single rule promotion usage record.
 */
export type RulePromotionUsage = {
  /**
   * The unique identifier of the usage record.
   */
  id?: string
  /**
   * The associated order ID, if applicable.
   */
  order_id?: string
  /**
   * The unique identifier of the promotion code.
   */
  code_id?: string
  /**
   * The promotion code used.
   */
  code?: string
  /**
   * The number of times the promotion code has been used.
   */
  times_used?: number
  /**
   * The timestamp when the promotion was applied.
   */
  used_on?: Date
  /**
   * The customer identifier who used the promotion, if applicable.
   */
  customer_id?: string
  /**
   * The email of the customer who used the promotion, if applicable.
   */
  customer_email?: string
  meta?: {
    timestamps?: {
      /**
       * The timestamp when the usage record was last updated.
       */
      updated_at?: Date
    }
  }
  /**
   * Identifier of the user or system that last updated the record.
   */
  updated_by?: string
  /**
   * Indicates whether the usage record has been anonymized.
   */
  anonymized?: boolean
}

export type ResponsePaginationMeta = {
  pagination?: {
    /**
     * Total number of available records.
     */
    total?: number
    /**
     * Number of records returned per page.
     */
    limit?: number
    /**
     * Number of records skipped.
     */
    offset?: number
    /**
     * Current page number.
     */
    current?: number
  }
}

export type ResponseError = {
  errors?: Array<{
    /**
     * HTTP status code.
     */
    status?: number
    /**
     * Error title.
     */
    title?: string
    /**
     * Error details.
     */
    detail?: string
  }>
}

export type PromotionCodeMessage = {
  /**
   * Information about the affected promotion codes.
   */
  source?: {
    /**
     * Indicates that the affected entity is a promotion code.
     */
    type?: "promotion_codes"
    /**
     * A list of promotion codes that triggered the message.
     */
    codes?: Array<string>
  }
  /**
   * A brief title summarizing the message.
   */
  title?: string
  /**
   * A detailed explanation of the message.
   */
  description?: string
}

/**
 * The Bearer token required to get access to the API.
 */
export type Authorization = string

export type GetRulePromotionsData = {
  body?: never
  headers: {
    /**
     * The Bearer token required to get access to the API.
     */
    Authorization: string
  }
  path?: never
  query?: {
    /**
     * This parameter accepts a filtering expression that uses specific operators and attributes.
     *
     * The following operators and attributes are available when filtering on this endpoint. See [Supported Filtering Characters](/guides/Getting-Started/filtering#supported-characters).
     *
     * | Attribute | Type     | Operator    | Example        |
     * |:--------- |:---------|:------------|:---------------|
     * | `code`    | `string`, `number` |  `eq`       |  `eq(code,summer2024)` |
     * | `name`    | `string`           |  `like`,`ilike`       |  `ilike(name, 'Summer *')` |
     * | `enabled`    | `boolean`       |  `eq`       |  `eq(enabled, true)` |
     * | `stackable`  | `boolean`       |  `eq`       |  `eq(stackable, true)` |
     * | `override_stacking`  | `boolean`       |  `eq`       |  `eq(override_stacking, true)` |
     * | `start`  | `date`       |  `lt`, `le`, `eq`, `gt`, `ge`       |  `gt(start, 2025-01-01T00:00:00.000Z)` |
     * | `end`  | `date`       |  `lt`, `le`, `eq`, `gt`, `ge`       |  `lt(end, 2025-01-01T00:00:00.000Z)` |
     *
     * Please note: promotion codes are case-insensitive. You can search for codes using only `numbers` or codes containing both `string` and `numbers`.
     *
     */
    filter?: string
  }
  url: "/v2/rule-promotions"
}

export type GetRulePromotionsResponses = {
  /**
   * OK
   */
  200: Array<RulePromotionResponse>
}

export type GetRulePromotionsResponse =
  GetRulePromotionsResponses[keyof GetRulePromotionsResponses]

export type CreateRulePromotionData = {
  body: RulePromotionRequest
  headers: {
    /**
     * The Bearer token required to get access to the API.
     */
    Authorization: string
  }
  path?: never
  query?: never
  url: "/v2/rule-promotions"
}

export type CreateRulePromotionResponses = {
  /**
   * Created
   */
  201: RulePromotionResponse
}

export type CreateRulePromotionResponse =
  CreateRulePromotionResponses[keyof CreateRulePromotionResponses]

export type DeleteRulePromotionData = {
  body?: never
  headers: {
    /**
     * The Bearer token required to get access to the API.
     */
    Authorization: string
  }
  path: {
    /**
     * The unique identifier of the promotion.
     */
    promotionID: string
  }
  query?: never
  url: "/v2/rule-promotions/{promotionID}"
}

export type DeleteRulePromotionResponses = {
  /**
   * No Content
   */
  204: void
}

export type DeleteRulePromotionResponse =
  DeleteRulePromotionResponses[keyof DeleteRulePromotionResponses]

export type GetRulePromotionByIdData = {
  body?: never
  headers: {
    /**
     * The Bearer token required to get access to the API.
     */
    Authorization: string
  }
  path: {
    /**
     * The unique identifier of the rule promotion.
     */
    promotionID: string
  }
  query?: never
  url: "/v2/rule-promotions/{promotionID}"
}

export type GetRulePromotionByIdResponses = {
  /**
   * OK
   */
  200: RulePromotionResponse
}

export type GetRulePromotionByIdResponse =
  GetRulePromotionByIdResponses[keyof GetRulePromotionByIdResponses]

export type UpdateRulePromotionData = {
  body: RulePromotionRequest
  headers: {
    /**
     * The Bearer token required to get access to the API.
     */
    Authorization: string
  }
  path: {
    /**
     * The unique identifier of the promotion to be updated.
     */
    promotionID: string
  }
  query?: never
  url: "/v2/rule-promotions/{promotionID}"
}

export type UpdateRulePromotionResponses = {
  /**
   * OK
   */
  200: RulePromotionResponse
}

export type UpdateRulePromotionResponse =
  UpdateRulePromotionResponses[keyof UpdateRulePromotionResponses]

export type DeleteRulePromotionCodesData = {
  body: PromotionCodesRequest
  headers: {
    /**
     * The Bearer token required to get access to the API.
     */
    Authorization: string
  }
  path: {
    /**
     * The unique identifier of the rule promotion.
     */
    promotionID: string
  }
  query?: never
  url: "/v2/rule-promotions/{promotionID}/codes"
}

export type DeleteRulePromotionCodesResponses = {
  /**
   * No Content
   */
  204: void
}

export type DeleteRulePromotionCodesResponse =
  DeleteRulePromotionCodesResponses[keyof DeleteRulePromotionCodesResponses]

export type GetRulePromotionCodesData = {
  body?: never
  headers: {
    /**
     * The Bearer token required to get access to the API.
     */
    Authorization: string
  }
  path: {
    /**
     * The unique identifier of the rule promotion.
     */
    promotionID: string
  }
  query?: never
  url: "/v2/rule-promotions/{promotionID}/codes"
}

export type GetRulePromotionCodesResponses = {
  /**
   * OK
   */
  200: GetPromotionCodesResponse
}

export type GetRulePromotionCodesResponse =
  GetRulePromotionCodesResponses[keyof GetRulePromotionCodesResponses]

export type CreateRulePromotionCodesData = {
  body: PromotionCodesRequest
  headers: {
    /**
     * The Bearer token required to get access to the API.
     */
    Authorization: string
  }
  path: {
    /**
     * The unique identifier of the rule promotion.
     */
    promotionID: string
  }
  query?: never
  url: "/v2/rule-promotions/{promotionID}/codes"
}

export type CreateRulePromotionCodesErrors = {
  /**
   * Bad Request
   */
  400: {
    errors?: Array<{
      status?: number
      source?: string
      title?: string
      detail?: string
    }>
  }
  /**
   * Unprocessable Entity
   */
  422: {
    errors?: Array<{
      status?: number
      source?: string
      title?: string
      detail?: string
    }>
  }
}

export type CreateRulePromotionCodesError =
  CreateRulePromotionCodesErrors[keyof CreateRulePromotionCodesErrors]

export type CreateRulePromotionCodesResponses = {
  /**
   * Created
   */
  201: CreatePromotionCodesResponse
}

export type CreateRulePromotionCodesResponse =
  CreateRulePromotionCodesResponses[keyof CreateRulePromotionCodesResponses]

export type DeleteSingleRulePromotionCodeData = {
  body?: never
  headers: {
    /**
     * The Bearer token required to get access to the API.
     */
    Authorization: string
  }
  path: {
    /**
     * The unique identifier of the rule promotion.
     */
    promotionID: string
    /**
     * The unique identifier of the rule promotion code.
     */
    codeID: string
  }
  query?: never
  url: "/v2/rule-promotions/{promotionID}/codes/{codeID}"
}

export type DeleteSingleRulePromotionCodeResponses = {
  /**
   * No Content
   */
  204: void
}

export type DeleteSingleRulePromotionCodeResponse =
  DeleteSingleRulePromotionCodeResponses[keyof DeleteSingleRulePromotionCodeResponses]

export type GetV2RulePromotionsByUuidJobsData = {
  body?: never
  path: {
    /**
     * The unique identifier of a rule promotion.
     */
    uuid: string
  }
  query?: {
    /**
     * Specifies filter attributes.
     */
    filter?: string
  }
  url: "/v2/rule-promotions/{uuid}/jobs"
}

export type GetV2RulePromotionsByUuidJobsResponses = {
  /**
   * Successful response
   */
  200: {
    data?: Array<PromotionJob>
  }
}

export type GetV2RulePromotionsByUuidJobsResponse =
  GetV2RulePromotionsByUuidJobsResponses[keyof GetV2RulePromotionsByUuidJobsResponses]

/**
 * Specifies the type of task to run.
 *
 */
export type JobType = "code_generate" | "code_export"

export type PostV2RulePromotionsByUuidJobsData = {
  body: {
    /**
     * Must be set to `promotion_job`.
     */
    type?: "promotion_job"
    /**
     * Specifies the type of task to run.
     *
     */
    job_type?: "code_generate" | "code_export"
    /**
     * Represents the name of the job. The maximum allowed length is 50 characters.
     */
    name?: string
    parameters?: {
      /**
       * Specifies the number of codes to be generated.
       */
      number_of_codes?: number
      /**
       * Specifies the maximum number of usages per code. If set to zero, you cannot use this promotion. If no value is set, it can be used unlimited times.
       */
      max_uses_per_code?: number
      /**
       * Specifies whether the code is consumed per application or per checkout. With `per_checkout`, the code is used once for each checkout, regardless of the number of items in the cart. When set to `per_application`, the code is used per application. For cart discounts, each application counts as one usage. For item discounts, each application to either a single quantity or a bundle is counted as one usage. For example, in a store that offers 50% off on SKU1, SKU2, and SKU3, and limits the maximum usage of the promotion code to two, a shopper can apply the promotion up to two quantities. If the cart contains two or more quantities of SKU1, the promotion is applied 2 times to SKU1, and other quantities and items are at the regular price. If the cart contains one quantity of SKU1, one quantity of SKU2, and one quantity of SKU3, the promotion is applied once to SKU1 and once to SKU2. The code usage is applied at checkout and the code is considered consumed at that point.
       *
       */
      consume_unit?: "per_application" | "per_checkout"
      /**
       * Prefix for generated promotion codes (e.g., `SUMMER-`).
       */
      code_prefix?: string
      /**
       * Code length.
       */
      code_length?: number
    }
  }
  path: {
    /**
     * The unique identifier of the rule promotion.
     */
    uuid: string
  }
  query?: never
  url: "/v2/rule-promotions/{uuid}/jobs"
}

export type PostV2RulePromotionsByUuidJobsErrors = {
  /**
   * Bad Request
   */
  400: {
    errors?: Array<{
      status?: string
      title?: string
      detail?: string
    }>
  }
}

export type PostV2RulePromotionsByUuidJobsError =
  PostV2RulePromotionsByUuidJobsErrors[keyof PostV2RulePromotionsByUuidJobsErrors]

export type PostV2RulePromotionsByUuidJobsResponses = {
  /**
   * Promotion job created
   */
  201: {
    data?: PromotionJob
  }
}

export type PostV2RulePromotionsByUuidJobsResponse =
  PostV2RulePromotionsByUuidJobsResponses[keyof PostV2RulePromotionsByUuidJobsResponses]

export type GetV2RulePromotionsByUuidJobsByJobUuidFileData = {
  body?: never
  path: {
    /**
     * The unique identifier of the rule promotion.
     */
    uuid: string
    /**
     * The unique identifier of the job associated with the file.
     */
    "job-uuid": string
  }
  query?: never
  url: "/v2/rule-promotions/{uuid}/jobs/{job-uuid}/file"
}

export type GetV2RulePromotionsByUuidJobsByJobUuidFileResponses = {
  /**
   * Successful response
   */
  200: {
    /**
     * URL to download the CSV file.
     */
    href?: string
  }
}

export type GetV2RulePromotionsByUuidJobsByJobUuidFileResponse =
  GetV2RulePromotionsByUuidJobsByJobUuidFileResponses[keyof GetV2RulePromotionsByUuidJobsByJobUuidFileResponses]

export type PostV2RulePromotionsByUuidJobsByJobUuidCancelData = {
  body?: never
  path: {
    /**
     * The unique identifier of the rule promotion.
     */
    uuid: string
    /**
     * The unique identifier of the job to be canceled.
     */
    "job-uuid": string
  }
  query?: never
  url: "/v2/rule-promotions/{uuid}/jobs/{job-uuid}/cancel"
}

export type PostV2RulePromotionsByUuidJobsByJobUuidCancelErrors = {
  /**
   * Unprocessable Entity
   */
  422: {
    errors?: Array<{
      status?: string
      title?: string
      detail?: string
    }>
  }
}

export type PostV2RulePromotionsByUuidJobsByJobUuidCancelError =
  PostV2RulePromotionsByUuidJobsByJobUuidCancelErrors[keyof PostV2RulePromotionsByUuidJobsByJobUuidCancelErrors]

export type PostV2RulePromotionsByUuidJobsByJobUuidCancelResponses = {
  /**
   * Successfully Canceled the Rule Promotion Job
   */
  200: PromotionJobCanceledResponse
}

export type PostV2RulePromotionsByUuidJobsByJobUuidCancelResponse =
  PostV2RulePromotionsByUuidJobsByJobUuidCancelResponses[keyof PostV2RulePromotionsByUuidJobsByJobUuidCancelResponses]

export type AnonymizeRulePromotionUsagesData = {
  body: {
    data: {
      /**
       * The unique identifiers of the usages to be anonymized.
       * Multiple usage IDs can be provided to anonymize in bulk.
       *
       */
      usage_ids?: Array<string>
    }
  }
  path?: never
  query?: never
  url: "/v2/rule-promotions/usages/anonymize"
}

export type AnonymizeRulePromotionUsagesErrors = {
  /**
   * Bad Request
   */
  400: ResponseError
  /**
   * Unauthorized
   */
  401: ResponseError
  /**
   * Not Found
   */
  404: ResponseError
}

export type AnonymizeRulePromotionUsagesError =
  AnonymizeRulePromotionUsagesErrors[keyof AnonymizeRulePromotionUsagesErrors]

export type AnonymizeRulePromotionUsagesResponses = {
  /**
   * OK
   */
  200: {
    data?: Array<RulePromotionUsage>
  }
}

export type AnonymizeRulePromotionUsagesResponse =
  AnonymizeRulePromotionUsagesResponses[keyof AnonymizeRulePromotionUsagesResponses]

export type GetRulePromotionUsagesData = {
  body?: never
  headers: {
    /**
     * The Bearer token required to get access to the API.
     */
    Authorization: string
  }
  path: {
    /**
     * The unique identifier of the rule promotion.
     */
    promotionID: string
  }
  query?: {
    /**
     * Filter attributes to refine the usage records. Supported attributes:
     * - `id`: Filter by usage ID.
     * - `code`: Filter by promotion code.
     * - `used_on`: Filter by usage date with operators `gt`, `ge`, `le`, `lt`.
     *
     */
    filter?: string
    /**
     * The number of records per page.
     */
    "page[limit]"?: number
    /**
     * The number of records to offset the results by.
     */
    "page[offset]"?: number
  }
  url: "/v2/rule-promotions/{promotionID}/usages"
}

export type GetRulePromotionUsagesErrors = {
  /**
   * Unauthorized
   */
  401: ResponseError
  /**
   * Not Found
   */
  404: ResponseError
}

export type GetRulePromotionUsagesError =
  GetRulePromotionUsagesErrors[keyof GetRulePromotionUsagesErrors]

export type GetRulePromotionUsagesResponses = {
  /**
   * Successful response
   */
  200: {
    data?: Array<RulePromotionUsage>
    meta?: ResponsePaginationMeta
  }
}

export type GetRulePromotionUsagesResponse =
  GetRulePromotionUsagesResponses[keyof GetRulePromotionUsagesResponses]

export type GetRulePromotionCodeUsagesData = {
  body?: never
  headers: {
    /**
     * The Bearer token required to get access to the API.
     */
    Authorization: string
  }
  path: {
    /**
     * The unique identifier of the rule promotion.
     */
    promotionID: string
    /**
     * The specific promotion code for which to retrieve usage records.
     */
    code: string
  }
  query?: {
    /**
     * Filter attributes to refine the results. Supported attributes:
     * - `id`: Filter by usage ID.
     * - `used_on`: Filter by date with operators `gt`, `ge`, `le`, `lt`.
     *
     */
    filter?: string
    /**
     * The number of records per page.
     */
    "page[limit]"?: number
    /**
     * The number of records to offset the results by.
     */
    "page[offset]"?: number
  }
  url: "/v2/rule-promotions/{promotionID}/codes/{code}/usages"
}

export type GetRulePromotionCodeUsagesErrors = {
  /**
   * Unauthorized
   */
  401: ResponseError
  /**
   * Not Found
   */
  404: ResponseError
}

export type GetRulePromotionCodeUsagesError =
  GetRulePromotionCodeUsagesErrors[keyof GetRulePromotionCodeUsagesErrors]

export type GetRulePromotionCodeUsagesResponses = {
  /**
   * Successful response
   */
  200: {
    data?: Array<RulePromotionUsage>
    meta?: ResponsePaginationMeta
  }
}

export type GetRulePromotionCodeUsagesResponse =
  GetRulePromotionCodeUsagesResponses[keyof GetRulePromotionCodeUsagesResponses]

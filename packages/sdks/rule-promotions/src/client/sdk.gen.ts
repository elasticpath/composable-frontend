// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options } from "@hey-api/client-fetch"
import type {
  GetRulePromotionsData,
  GetRulePromotionsResponse,
  CreateRulePromotionData,
  CreateRulePromotionResponse,
  DeleteRulePromotionData,
  DeleteRulePromotionResponse,
  GetRulePromotionByIdData,
  GetRulePromotionByIdResponse,
  UpdateRulePromotionData,
  UpdateRulePromotionResponse,
  DeleteRulePromotionCodesData,
  DeleteRulePromotionCodesResponse,
  GetRulePromotionCodesData,
  GetRulePromotionCodesResponse,
  CreateRulePromotionCodesData,
  CreateRulePromotionCodesResponse,
  CreateRulePromotionCodesError,
  DeleteSingleRulePromotionCodeData,
  DeleteSingleRulePromotionCodeResponse,
  GetV2RulePromotionsByUuidJobsData,
  GetV2RulePromotionsByUuidJobsResponse,
  PostV2RulePromotionsByUuidJobsData,
  PostV2RulePromotionsByUuidJobsResponse,
  PostV2RulePromotionsByUuidJobsError,
  GetV2RulePromotionsByUuidJobsByJobUuidFileData,
  GetV2RulePromotionsByUuidJobsByJobUuidFileResponse,
  PostV2RulePromotionsByUuidJobsByJobUuidCancelData,
  PostV2RulePromotionsByUuidJobsByJobUuidCancelResponse,
  PostV2RulePromotionsByUuidJobsByJobUuidCancelError,
  AnonymizeRulePromotionUsagesData,
  AnonymizeRulePromotionUsagesResponse,
  AnonymizeRulePromotionUsagesError,
  GetRulePromotionUsagesData,
  GetRulePromotionUsagesResponse,
  GetRulePromotionUsagesError,
  GetRulePromotionCodeUsagesData,
  GetRulePromotionCodeUsagesResponse,
  GetRulePromotionCodeUsagesError,
} from "./types.gen"

export const client = createClient(createConfig())

/**
 * Get Rule Promotions
 * Retrieves a list of rule-based promotions, including information such as discount type, eligibility criteria,
 * and configuration details. This endpoint supports filtering to refine results based on specific promotion attributes.
 *
 * Use query parameters to filter promotions by:
 * - **Code** – Retrieve a specific promotion by its code.
 * - **Promotion name** – Search for promotions by name.
 * - **Activation status** – Filter by whether a promotion is active or not.
 * - **Stackability** – Identify promotions that can or cannot be combined with others.
 * - **Start and end dates** – Retrieve promotions based on their validity periods.
 *
 */
export const getRulePromotions = <ThrowOnError extends boolean = false>(
  options: Options<GetRulePromotionsData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetRulePromotionsResponse,
    unknown,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/rule-promotions",
  })
}

/**
 * Create a Rule Promotion
 * Creates a new rule-based promotion, allowing flexible discount strategies based on cart or item conditions.
 * Promotions can apply fixed or percentage-based discounts, apply automatically or via codes, and have eligibility rules
 * based on product attributes, cart total, SKU conditions, custom attributes, and more.
 *
 * This endpoint supports a variety of promotion types, such as:
 * - **Cart-wide discounts**
 * - **Item-specific discounts**
 * - **Shipping discounts**
 * - **Combinations thereof**
 *
 * :::note
 *
 * The minimum item discount amount is zero, both for amounts and percentages
 *
 * :::
 *
 * Please refer to the **OpenAPI examples** section on this page for detailed request payloads illustrating different
 * promotion structures, including cart discounts, item discounts, and rule-based conditions.
 *
 */
export const createRulePromotion = <ThrowOnError extends boolean = false>(
  options: Options<CreateRulePromotionData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    CreateRulePromotionResponse,
    unknown,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/rule-promotions",
  })
}

/**
 * Delete a Rule Promotion
 * Deletes an existing Rule Promotion identified by its promotion ID.
 *
 * - This action **permanently removes** the promotion and cannot be undone.
 * - If the promotion is active, please ensure that its removal does not impact ongoing campaigns.
 *
 * A successful request returns a `204 No Content` response, indicating that the promotion has been deleted.
 *
 */
export const deleteRulePromotion = <ThrowOnError extends boolean = false>(
  options: Options<DeleteRulePromotionData, ThrowOnError>,
) => {
  return (options?.client ?? client).delete<
    DeleteRulePromotionResponse,
    unknown,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/rule-promotions/{promotionID}",
  })
}

/**
 * Get a Rule Promotion by ID
 * Retrieves a single Rule Promotion by the promotion ID. Responses include promotion specifications such as discount type, eligibility criteria, and configuration details.
 *
 */
export const getRulePromotionById = <ThrowOnError extends boolean = false>(
  options: Options<GetRulePromotionByIdData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetRulePromotionByIdResponse,
    unknown,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/rule-promotions/{promotionID}",
  })
}

/**
 * Update a Rule Promotion
 * Updates an existing Rule Promotion specified by its promotion ID. This includes both **semantic and syntactic validation** to ensure correctness. For example, the start date must be earlier than the end date.
 *
 * Editable fields include:
 * - `name`
 * - `description`
 * - `enabled`
 * - `start`
 * - `end`
 * - `automatic`
 * - `stackable`
 * - `override_stacking`
 * - `rule_set`
 *
 * Please refer to the **OpenAPI examples** section on this page for sample update requests.
 *
 */
export const updateRulePromotion = <ThrowOnError extends boolean = false>(
  options: Options<UpdateRulePromotionData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateRulePromotionResponse,
    unknown,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/rule-promotions/{promotionID}",
  })
}

/**
 * Delete Rule Promotion Codes
 * Deletes one or more promotion codes from a specific rule promotion.
 *
 * - Supports **bulk deletion**, allowing multiple codes to be removed in a single request.
 * - Removes promotion codes permanently, making them unavailable for future use.
 * - If a code has already been redeemed, it will be removed from the system but may still reflect in historical transactions.
 *
 * A successful request returns a `204 No Content` response, indicating the specified promotion codes have been deleted.
 *
 */
export const deleteRulePromotionCodes = <ThrowOnError extends boolean = false>(
  options: Options<DeleteRulePromotionCodesData, ThrowOnError>,
) => {
  return (options?.client ?? client).delete<
    DeleteRulePromotionCodesResponse,
    unknown,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/rule-promotions/{promotionID}/codes",
  })
}

/**
 * Get Rule Promotion Codes
 * Retrieves the list of promotion codes associated with a specific Rule Promotion.
 *
 * - Returns all codes generated for the given promotion ID, including details on usage limits and redemption status.
 * - Supports both automatically generated and manually created promotion codes.
 * - Can be used to verify whether a promotion code is still valid or has reached its usage limit.
 *
 */
export const getRulePromotionCodes = <ThrowOnError extends boolean = false>(
  options: Options<GetRulePromotionCodesData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetRulePromotionCodesResponse,
    unknown,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/rule-promotions/{promotionID}/codes",
  })
}

/**
 * Create Rule Promotion Codes
 * Creates new promotion codes for a specific rule promotion, allowing customers to redeem discounts based on predefined conditions.
 *
 * - Supports  bulk creation of multiple promotion codes in a single request.
 * - Each code can have individual usage limits.
 * - Can optionally assign codes to specific users to enforce targeted promotions.
 * - The promotion codes are case-insensitive.
 *
 * :::note
 *
 * Regarding first time shopper limitations:
 * - Orders without payment transactions do not count as completed purchases.
 * - Canceling or refunding an order does not reinstate first-time shopper status.
 * - A first-time shopper coupon code cannot have limited uses or be assigned to specific users, meaning the code cannot be restricted by the number of times it can be used or tied to a specific customer ID.
 *
 * :::
 *
 * A successful request returns a `201 Created` response with details of the generated promotion codes.
 *
 * ### Duplicate Codes
 * Duplicate promotion codes **are supported across different promotions** in the store, regardless of their statuses and validity dates. However, **duplicate codes cannot be created within the same promotion**.
 * This means that shoppers can apply a single coupon code to trigger multiple promotions if those promotions share common coupon codes.
 *
 * Codes that share the same name can serve different purposes.  For example, one code may have `per_application` with a limited number of uses, while another identical code can have `per_checkout` with unlimited use.
 *
 * **Duplicate Code Handling:**
 * - If a duplicate code is detected **within the same promotion**, the request will return a `422 Duplicate code` error.
 * - When creating duplicate codes, a message appears with the successful response indicating the duplication.
 *
 *
 * Please refer to the **OpenAPI examples** section on this page for sample request structures.
 *
 */
export const createRulePromotionCodes = <ThrowOnError extends boolean = false>(
  options: Options<CreateRulePromotionCodesData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    CreateRulePromotionCodesResponse,
    CreateRulePromotionCodesError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/rule-promotions/{promotionID}/codes",
  })
}

/**
 * Delete A Single Rule Promotion Code
 * Deletes a single promotion code from a specific rule promotion.
 *
 * - Permanently removes the specified promotion code, making it unavailable for future use.
 * - Can be used to **revoke a specific code** without affecting other codes under the same promotion.
 * - If the code has already been redeemed, it will still be removed from the system but may still reflect in historical transactions.
 *
 * A successful request returns a `204 No Content` response, indicating the specified promotion code has been deleted.
 *
 */
export const deleteSingleRulePromotionCode = <
  ThrowOnError extends boolean = false,
>(
  options: Options<DeleteSingleRulePromotionCodeData, ThrowOnError>,
) => {
  return (options?.client ?? client).delete<
    DeleteSingleRulePromotionCodeResponse,
    unknown,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/rule-promotions/{promotionID}/codes/{codeID}",
  })
}

/**
 * Get Rule Promotion Jobs
 * Retrieves a list of jobs associated with a specific rule promotion. Each job represents an asynchronous operation such as promotion code generation or export.
 *
 * The response includes details such as:
 * - **Job type** (`code_generate` or `code_export`)
 * - **Job status** (`pending`, `processing`, `completed`, `failed`, `cancelling`, or `cancelled`)
 * - **Parameters used** (such as number of codes generated)
 * - **Results** (such as number of codes successfully generated or deleted)
 *
 * ### Filtering
 * You can filter jobs by:
 * - **Job Type** (`eq(job_type, code_export)`)
 * - **Status** (`eq(status, complete)`)
 *
 */
export const getV2RulePromotionsByUuidJobs = <
  ThrowOnError extends boolean = false,
>(
  options: Options<GetV2RulePromotionsByUuidJobsData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetV2RulePromotionsByUuidJobsResponse,
    unknown,
    ThrowOnError
  >({
    ...options,
    url: "/v2/rule-promotions/{uuid}/jobs",
  })
}

/**
 * Create a Rule Promotion Job
 * Creates an asynchronous job for a specific Rule Promotion. Jobs are used to generate or export promotion codes in bulk.
 *
 * The following job types are supported:
 * - **`code_generate`**: Generates a batch of unique promotion codes.
 * - **`code_export`**: Exports all existing promotion codes as a downloadable CSV file.
 *
 * Job processing occurs asynchronously. The job request is queued, and its status must be checked separately.
 *
 * ### Job Processing Status
 * Jobs can have the following statuses:
 * - `pending`: Job is in the queue, waiting to be processed.
 * - `processing`: Job is actively being processed.
 * - `completed`: Job completed successfully.
 * - `failed`: Job encountered an error and did not complete.
 * - `cancelling`: Cancellation in progress (for long-running jobs).
 * - `cancelled`: Job was successfully cancelled.
 *
 * Please refer to the **OpenAPI examples** section on this page for sample job creation requests.
 *
 */
export const postV2RulePromotionsByUuidJobs = <
  ThrowOnError extends boolean = false,
>(
  options: Options<PostV2RulePromotionsByUuidJobsData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    PostV2RulePromotionsByUuidJobsResponse,
    PostV2RulePromotionsByUuidJobsError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/v2/rule-promotions/{uuid}/jobs",
  })
}

/**
 * Get Rule Promotion Code Exported File
 * Retrieves the exported promotion codes for a rule promotion job in a CSV format.
 *
 * - The file contains the generated codes along with relevant metadata.
 * - This endpoint is applicable only for jobs of type `code_export`.
 * - The job must be in a `completed` state before the file can be retrieved.
 *
 */
export const getV2RulePromotionsByUuidJobsByJobUuidFile = <
  ThrowOnError extends boolean = false,
>(
  options: Options<
    GetV2RulePromotionsByUuidJobsByJobUuidFileData,
    ThrowOnError
  >,
) => {
  return (options?.client ?? client).get<
    GetV2RulePromotionsByUuidJobsByJobUuidFileResponse,
    unknown,
    ThrowOnError
  >({
    ...options,
    url: "/v2/rule-promotions/{uuid}/jobs/{job-uuid}/file",
  })
}

/**
 * Cancel a Rule Promotion Job
 * Cancels an asynchronous job for a rule promotion if its status is `pending` or `processing`.
 *
 * - Only jobs that have not yet completed can be canceled.
 * - Once canceled, no further processing occurs, and partially completed results may be deleted.
 *
 */
export const postV2RulePromotionsByUuidJobsByJobUuidCancel = <
  ThrowOnError extends boolean = false,
>(
  options: Options<
    PostV2RulePromotionsByUuidJobsByJobUuidCancelData,
    ThrowOnError
  >,
) => {
  return (options?.client ?? client).post<
    PostV2RulePromotionsByUuidJobsByJobUuidCancelResponse,
    PostV2RulePromotionsByUuidJobsByJobUuidCancelError,
    ThrowOnError
  >({
    ...options,
    url: "/v2/rule-promotions/{uuid}/jobs/{job-uuid}/cancel",
  })
}

/**
 * Anonymize Rule Promotion Usages
 * Anonymizes user-related data in Rule Promotion usage records.
 * This operation is typically used for GDPR compliance or privacy-related requests.
 *
 * - This process replaces identifiable user data with anonymized placeholders.
 * - Affects all recorded promotion usages where customer data is stored.
 * - Does not impact historical transaction records or applied discounts.
 *
 * A successful request returns a `200 OK` response with the anonymized usage records.
 *
 */
export const anonymizeRulePromotionUsages = <
  ThrowOnError extends boolean = false,
>(
  options: Options<AnonymizeRulePromotionUsagesData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    AnonymizeRulePromotionUsagesResponse,
    AnonymizeRulePromotionUsagesError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/rule-promotions/usages/anonymize",
  })
}

/**
 * Get Rule Promotion Usages
 * Retrieves a list of usage records for a specific Rule Promotion.
 *
 * - Provides details about when and how a promotion was used.
 * - Can be filtered and paginated to refine results.
 * - Useful for analyzing promotion effectiveness and customer engagement.
 *
 */
export const getRulePromotionUsages = <ThrowOnError extends boolean = false>(
  options: Options<GetRulePromotionUsagesData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetRulePromotionUsagesResponse,
    GetRulePromotionUsagesError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/rule-promotions/{promotionID}/usages",
  })
}

/**
 * Get Rule Promotion Code Usages
 * Retrieves a list of usage records for a specific Rule Promotion code.
 *
 * - Provides insights into how many times a specific code was used.
 * - Can be filtered and paginated to refine results.
 * - Useful for tracking the performance of individual promotion codes.
 *
 */
export const getRulePromotionCodeUsages = <
  ThrowOnError extends boolean = false,
>(
  options: Options<GetRulePromotionCodeUsagesData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetRulePromotionCodeUsagesResponse,
    GetRulePromotionCodeUsagesError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/rule-promotions/{promotionID}/codes/{code}/usages",
  })
}

# @epcc-sdk/rule-promotions

## 0.1.0

### Minor Changes

- b195c7b5: Regenerate from the upstream `rule-promotions` spec (spec version 26.0504.7552059, published 2026-05-04T17:39:21Z).

  Adds 79 exported symbols.

  **Breaking.** Removes 25 exported symbols:

  - `rule-promotions: Type`
  - `rule-promotions: RulePromotionRequest`
  - `rule-promotions: PromotionJobCreatedResponse`
  - `rule-promotions: PromotionJobCanceledResponse`
  - `rule-promotions: ResponsePaginationMeta`
  - `rule-promotions: GetV2RulePromotionsByUuidJobsData`
  - `rule-promotions: GetV2RulePromotionsByUuidJobsResponses`
  - `rule-promotions: GetV2RulePromotionsByUuidJobsResponse`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsData`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsErrors`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsError`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsResponses`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsResponse`
  - `rule-promotions: GetV2RulePromotionsByUuidJobsByJobUuidFileData`
  - `rule-promotions: GetV2RulePromotionsByUuidJobsByJobUuidFileResponses`
  - `rule-promotions: GetV2RulePromotionsByUuidJobsByJobUuidFileResponse`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsByJobUuidCancelData`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsByJobUuidCancelErrors`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsByJobUuidCancelError`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsByJobUuidCancelResponses`
  - `rule-promotions: PostV2RulePromotionsByUuidJobsByJobUuidCancelResponse`
  - `rule-promotions: getV2RulePromotionsByUuidJobs`
  - `rule-promotions: postV2RulePromotionsByUuidJobs`
  - `rule-promotions: getV2RulePromotionsByUuidJobsByJobUuidFile`
  - `rule-promotions: postV2RulePromotionsByUuidJobsByJobUuidCancel`

## 0.0.3

### Patch Changes

- 38ea71fc: add max unit in rule promotion limitation

## 0.0.2

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.1

### Patch Changes

- e5fbcf1: Release missing sdks

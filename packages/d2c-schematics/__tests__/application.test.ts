/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing"
import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ApplicationOptions } from "../application/schema"

describe("Application Schematic", () => {
  const schematicRunner = new SchematicTestRunner(
    "@schematics/angular",
    require.resolve("../collection.json"),
  )

  const workspaceOptions: WorkspaceOptions = {
    name: "workspace",
    epccClientId: "123",
    epccClientSecret: "456",
    epccEndpointUrl: "euwest.api.elasticpath.com",
  }

  const defaultOptions: ApplicationOptions = {
    name: "foo",
  }

  let workspaceTree: UnitTestTree
  beforeEach(async () => {
    workspaceTree = await schematicRunner.runSchematic(
      "workspace",
      workspaceOptions,
    )
  })

  it("should create public files for core application", async () => {
    const options = { ...defaultOptions }

    try {
      const tree = await schematicRunner.runSchematic(
        "application",
        options,
        workspaceTree,
      )

      const files = tree.files

      expect(files).toContain("/public/favicon.ico")
    } catch (err) {
      throw new Error(err)
    }
  })

  it("should create core style files for application", async () => {
    const options = { ...defaultOptions }

    try {
      const tree = await schematicRunner.runSchematic(
        "application",
        options,
        workspaceTree,
      )

      const files = tree.files

      expect(files).toIncludeAllPartialMembers(["/src/styles/globals.css"])
    } catch (err) {
      throw new Error(err)
    }
  })

  it("should create middleware files of an application", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner.runSchematic(
      "application",
      options,
      workspaceTree,
    )

    const files = tree.files

    expect(files).toIncludeAllPartialMembers([
      "/src/middleware.ts",
      "/src/lib/types/non-empty-array.ts",
      "/src/lib/form-url-encode-body.ts",
      "/src/lib/middleware/middleware-runner.ts",
      "/src/lib/middleware/create-missing-environment-variable-url",
      "/src/lib/middleware/cart-cookie-middleware.ts",
      "/src/lib/middleware/implicit-auth-middleware.ts",
      "/src/lib/token-expired.ts",
    ])
  })

  it("should create core files of an application", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner.runSchematic(
      "application",
      options,
      workspaceTree,
    )

    const files = tree.files

    expect(files.filter((f) => f.startsWith("/src/")).sort()).toEqual(
      [
        "/src/app/about/page.tsx",
        "/src/app/configuration-error/page.tsx",
        "/src/app/error.tsx",
        "/src/app/faq/page.tsx",
        "/src/app/layout.tsx",
        "/src/app/not-found.tsx",
        "/src/app/providers.tsx",
        "/src/app/shipping/page.tsx",
        "/src/app/terms/page.tsx",
        "/src/components/Spinner.tsx",
        "/src/components/icons/ep-icon.tsx",
        "/src/components/icons/ep-logo.tsx",
        "/src/components/icons/github-icon.tsx",
        "/src/components/shared/blurb.tsx",
        "/src/components/shimmer.tsx",
        "/src/components/toast/toaster.tsx",
        "/src/lib/build-site-navigation.ts",
        "/src/lib/cookie-constants.ts",
        "/src/lib/custom-rule-headers.ts",
        "/src/lib/ep-client-store.ts",
        "/src/lib/epcc-errors.ts",
        "/src/lib/epcc-implicit-client.ts",
        "/src/lib/epcc-server-client.ts",
        "/src/lib/epcc-server-side-implicit-client.ts",
        "/src/lib/form-url-encode-body.ts",
        "/src/lib/get-store-context.ts",
        "/src/lib/is-empty-object.ts",
        "/src/lib/middleware/apply-set-cookie.ts",
        "/src/lib/middleware/cart-cookie-middleware.ts",
        "/src/lib/middleware/create-missing-environment-variable-url.ts",
        "/src/lib/middleware/implicit-auth-middleware.ts",
        "/src/lib/middleware/middleware-runner.ts",
        "/src/lib/parse-cookie.ts",
        "/src/lib/providers/store-provider.tsx",
        "/src/lib/resolve-cart-env.ts",
        "/src/lib/resolve-ep-currency-code.ts",
        "/src/lib/resolve-epcc-env.ts",
        "/src/lib/sort-alphabetically.ts",
        "/src/lib/to-base-64.ts",
        "/src/lib/token-expired.ts",
        "/src/lib/types/deep-partial.ts",
        "/src/lib/types/non-empty-array.ts",
        "/src/lib/types/read-only-non-empty-array.ts",
        "/src/middleware.ts",
        "/src/services/hierarchy.ts",
        "/src/styles/globals.css",
      ].sort(),
    )
  })
})

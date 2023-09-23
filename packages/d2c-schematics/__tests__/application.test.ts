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
    require.resolve("../collection.json")
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
    workspaceTree = await schematicRunner
      .runSchematicAsync("workspace", workspaceOptions)
      .toPromise()
  })

  it("should create public files for core application", async () => {
    const options = { ...defaultOptions }

    try {
      const tree = await schematicRunner
        .runSchematicAsync("application", options, workspaceTree)
        .toPromise()
      const files = tree.files

      expect(files).toIncludeAllPartialMembers([
        "/public/icons/empty.svg",
        "/public/icons/ep-icon.svg",
        "/public/icons/ep-logo.svg",
        "/public/icons/github.svg",
        "/public/favicon.ico",
      ])
    } catch (err) {
      throw new Error(err)
    }
  })

  it("should create core style files for application", async () => {
    const options = { ...defaultOptions }

    try {
      const tree = await schematicRunner
        .runSchematicAsync("application", options, workspaceTree)
        .toPromise()
      const files = tree.files

      expect(files).toIncludeAllPartialMembers(["/src/styles/globals.css"])
    } catch (err) {
      throw new Error(err)
    }
  })

  it("should create middleware files of an application", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner
      .runSchematicAsync("application", options, workspaceTree)
      .toPromise()
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
    const tree = await schematicRunner
      .runSchematicAsync("application", options, workspaceTree)
      .toPromise()
    const files = tree.files

    expect(files).toIncludeAllPartialMembers([
      "/src/pages/404.tsx",
      "/src/pages/500.tsx",
      "/src/pages/_app.tsx",
      "/src/pages/configuration-error.tsx",
      "/src/lib/resolve-epcc-env.ts",
      "/src/lib/parse-cookie.ts",
      "/src/components/shimmer.tsx",
      "/src/components/toast/toaster.tsx",
      "/src/components/layouts/MainLayout.tsx",
      "/src/lib/providers/store-provider.ts",
      "/src/lib/to-base-64.ts",
      "/src/lib/store-wrapper-ssg.ts",
      "/src/lib/build-site-navigation.ts",
      "/src/lib/epcc-implicit-client.ts",
      "/src/lib/epcc-server-client.ts",
      "/src/lib/custom-rule-headers.ts",
      "/src/lib/ep-client-store.ts",
      "/src/lib/resolve-epcc-env.ts",
      "/src/lib/is-empty-object.ts",
      "/src/lib/menu-style.ts",
      "/src/lib/types/read-only-non-empty-array.ts",
      "/src/lib/sort-alphabetically.ts",
      "/src/lib/get-main-layout.tsx",
      "/src/lib/epcc-errors.ts",
    ])
  })
})

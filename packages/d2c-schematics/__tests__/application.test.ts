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

      expect(files).toMatchSnapshot()
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

      expect(files).toMatchSnapshot()
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

    expect(files).toMatchSnapshot()
  })

  it("should create core files of an application", async () => {
    const options = { ...defaultOptions }
    const tree = await schematicRunner.runSchematic(
      "application",
      options,
      workspaceTree,
    )

    const files = tree.files

    expect(files).toMatchSnapshot()
  })
})

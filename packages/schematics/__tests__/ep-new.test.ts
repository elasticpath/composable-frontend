/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { SchematicTestRunner } from "@angular-devkit/schematics/testing"
import path from "path"
import { Schema as EPNewOptions } from "../ep-new/schema"

const collectionPath = path.join(__dirname, "../collection.json")

describe("EP New Schematic", () => {
  const schematicRunner = new SchematicTestRunner("schematics", collectionPath)
  const defaultOptions: EPNewOptions = {
    name: "foo",
    directory: "bar",
    epccClientId: "123",
    epccClientSecret: "456",
    epccEndpointUrl: "api.moltin.com"
  }

  it("should create files of a workspace", async () => {
    const options = { ...defaultOptions }

    const tree: any = await schematicRunner
      .runSchematicAsync("ep-new", options)
      .toPromise()
      .catch(err => console.log("error caught:", err))

    const files = tree.files
    expect(files).toContain("/bar/package.json")
  })

  it("should create files of an application", async () => {
    const options = { ...defaultOptions }

    const tree = await schematicRunner
      .runSchematicAsync("ep-new", options)
      .toPromise()
    const files = tree.files
    expect(files).toEqual(
      expect.arrayContaining(["/bar/public/icons/empty.svg"])
    )
  })
})

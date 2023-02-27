import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing"

import { Schema as WorkspaceOptions } from "../workspace/schema"
import { Schema as ApplicationOptions } from "../application/schema"
import { Schema as AlgoliaProductListOptions } from "../product-list-page-algolia/schema"
import {
  ALGOLIA_API_KEY,
  ALGOLIA_APP_ID,
  ALGOLIA_DEPENDENCIES,
  ALGOLIA_INDEX_NAME,
} from "../product-list-page-algolia"
import { latestVersions } from "../utility/latest-versions"
import { parseEnv } from "../utility/add-env-variable"

describe("Product List Page Algolia Schematic", () => {
  const schematicRunner = new SchematicTestRunner(
    "@schematics/angular",
    require.resolve("../collection.json")
  )

  const epccMockOptions = {
    epccClientId: "123",
    epccClientSecret: "456",
    epccEndpointUrl: "euwest.api.elasticpath.com",
  }

  const workspaceOptions: WorkspaceOptions = {
    name: "workspace",
    ...epccMockOptions,
  }

  const applicationOptions: ApplicationOptions = {
    name: "foo",
  }

  const xPromptValues: Partial<AlgoliaProductListOptions> = {
    algoliaAdminApiKey: "abc-admin-api-key",
    algoliaApplicationId: "def-application-id",
    algoliaSearchOnlyApiKey: "ghi-search-only-key",
  }

  let initTree: UnitTestTree
  beforeEach(async () => {
    /**
     * Algolia Product List Page schematic depends on workspace and application schematics
     */
    const workspaceTree = await schematicRunner
      .runSchematicAsync("workspace", workspaceOptions)
      .toPromise()
    initTree = await schematicRunner
      .runSchematicAsync("application", applicationOptions, workspaceTree)
      .toPromise()
  })

  it("algolia product list page schematic should create example files", async () => {
    const tree = await schematicRunner
      .runSchematicAsync(
        "plp",
        { plpType: "Algolia", ...epccMockOptions, ...xPromptValues },
        initTree
      )
      .toPromise()
    const files = tree.files

    // TODO add rest of expected files
    expect(files).toIncludeAnyMembers(["/src/components/search/Hit.tsx"])
  })

  it("algolia product list page schematic should add algolia dependencies to package.json", async () => {
    const tree = await schematicRunner
      .runSchematicAsync(
        "plp",
        { plpType: "Algolia", ...epccMockOptions, ...xPromptValues },
        initTree
      )
      .toPromise()

    const pkg = JSON.parse(tree.readContent("/package.json"))

    ALGOLIA_DEPENDENCIES.forEach((dep) => {
      expect(pkg.dependencies[dep]).toBe(latestVersions[dep])
    })
  })

  it("algolia product list page schematic should update .env.local", async () => {
    const tree = await schematicRunner
      .runSchematicAsync(
        "plp",
        { plpType: "Algolia", ...epccMockOptions, ...xPromptValues },
        initTree
      )
      .toPromise()

    const rawText = tree.readText("/.env.local")
    const parsed = parseEnv(rawText)

    expect(parsed[ALGOLIA_APP_ID]).toEqual("def-application-id")
    expect(parsed[ALGOLIA_API_KEY]).toEqual("ghi-search-only-key")
    expect(parsed[ALGOLIA_INDEX_NAME]).toEqual("abc123")
  })
})

import { NodeWorkflow } from "@angular-devkit/schematics/tools"
import { SchematicEngineHost } from "./schematic-engine-host"

const DEFAULT_SCHEMATICS_COLLECTION = "@elasticpath/d2c-schematics"

export function getOrCreateWorkflowForBuilder(
  collectionName: string,
  root: string,
  workspace: string,
): NodeWorkflow {
  const resolvePaths = getResolvePaths(collectionName, workspace, root)
  return new NodeWorkflow(root, {
    resolvePaths: resolvePaths,
    engineHostCreator: (options) =>
      new SchematicEngineHost(options.resolvePaths),
  })
}

function getResolvePaths(
  collectionName: string,
  workspace: string,
  root: string,
): string[] {
  return workspace
    ? // Workspace
      collectionName === DEFAULT_SCHEMATICS_COLLECTION
      ? // Favor __dirname for "@elasticpath/d2c-schematics" to use the build-in version
        [__dirname, process.cwd(), root]
      : [process.cwd(), root, __dirname]
    : // Global
      [__dirname, process.cwd()]
}

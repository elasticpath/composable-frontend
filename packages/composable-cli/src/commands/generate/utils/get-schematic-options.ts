import { Collection } from "@angular-devkit/schematics"
import {
  FileSystemCollectionDescription,
  FileSystemSchematicDescription,
  NodeWorkflow,
} from "@angular-devkit/schematics/tools"
import { parseJsonSchemaToOptions } from "./json-schema"

export async function getSchematicOptions(
  collection: Collection<
    FileSystemCollectionDescription,
    FileSystemSchematicDescription
  >,
  schematicName: string,
  workflow: NodeWorkflow
): Promise<any> {
  const schematic = collection.createSchematic(schematicName, true)
  const { schemaJson } = schematic.description

  if (!schemaJson) {
    return []
  }

  return parseJsonSchemaToOptions(workflow.registry, schemaJson)
}

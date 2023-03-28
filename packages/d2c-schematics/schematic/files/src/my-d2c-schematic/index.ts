import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  externalSchematic,
} from "@angular-devkit/schematics";

export default function (options: any): Rule {
  return chain([
    (_tree: Tree, context: SchematicContext) => {
      context.logger.info("My Other Schematic: " + JSON.stringify(options));
    },
    // calling an external schematic that is hosted outside the collection.
    // Make sure to yarn install the external schematic collection
    externalSchematic("@elasticpath/d2c-schematics", "workspace", {
      name: options.name,
      epccClientId: "123",
      epccClientSecret: "456",
      epccEndpointUrl: "https://example.com",
    }),
  ]);
}

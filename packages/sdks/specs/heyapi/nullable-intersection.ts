import type { IR, Plugins } from "@hey-api/openapi-ts"

type IntersectionResolver = NonNullable<
  Plugins.HeyApiTypeScript.Resolvers["intersection"]
>

const isUnionWithNull = (schema: IR.SchemaObject) =>
  schema.logicalOperator === "or" &&
  (schema.items ?? []).some((item) => item.type === "null")

export const nullableIntersection: IntersectionResolver = (ctx) => {
  if (!ctx.schemas.some(isUnionWithNull)) return undefined
  return ctx.$.type.or(ctx.nodes.base(ctx), ctx.$.type("null"))
}

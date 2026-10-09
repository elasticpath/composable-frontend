import type { Plugins } from "@hey-api/openapi-ts"

type ZodNumberResolver = NonNullable<Plugins.Zod.Resolvers["number"]>
type ZodNumberContext = Parameters<ZodNumberResolver>[0]
type ZodNumberSchema = ZodNumberContext["schema"]

const originalFormats = new WeakMap<
  ZodNumberSchema,
  ZodNumberSchema["format"]
>()

const originalFormatOf = (schema: ZodNumberSchema) =>
  originalFormats.has(schema) ? originalFormats.get(schema) : schema.format

const clearFormat = (schema: ZodNumberSchema) => {
  if (!originalFormats.has(schema)) originalFormats.set(schema, schema.format)
  schema.format = undefined
}

export const int64AsNumber: ZodNumberResolver = (ctx) => {
  if (!ctx.utils.shouldCoerceToBigInt(originalFormatOf(ctx.schema))) {
    return undefined
  }

  clearFormat(ctx.schema)

  const { $ } = ctx
  const z = ctx.plugin.imports.z

  const literal = ctx.nodes.const(ctx)
  if (literal) return literal

  ctx.chain.current = $(z).attr("number").call().attr("int").call()
  ctx.chain.current = ctx.nodes.min(ctx) ?? ctx.chain.current
  ctx.chain.current = ctx.nodes.max(ctx) ?? ctx.chain.current

  const numericStringsToNumbers = $.func()
    .param("v")
    .do(
      $.return(
        $.ternary($.typeofExpr("v").eq($.literal("string")))
          .do($("Number").call("v"))
          .otherwise("v"),
      ),
    )

  return $(z)
    .attr("preprocess")
    .call(numericStringsToNumbers, ctx.chain.current)
}

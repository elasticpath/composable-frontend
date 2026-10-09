import type { Plugins } from "@hey-api/openapi-ts"

type ZodNumberResolver = NonNullable<Plugins.Zod.Resolvers["number"]>
type ZodNumberContext = Parameters<ZodNumberResolver>[0]

const int64FormatsHiddenFromTheDefault = new WeakMap<object, string>()

const formatOf = (schema: ZodNumberContext["schema"]) =>
  int64FormatsHiddenFromTheDefault.get(schema) ?? schema.format

const hideTheFormatFromTheDefault = (schema: ZodNumberContext["schema"]) => {
  int64FormatsHiddenFromTheDefault.set(schema, schema.format as string)
  schema.format = undefined
}

export const int64AsNumber: ZodNumberResolver = (ctx) => {
  if (!ctx.utils.shouldCoerceToBigInt(formatOf(ctx.schema))) return undefined

  const { $ } = ctx
  const z = ctx.plugin.imports.z
  const withoutTheFormatRange = {
    ...ctx,
    schema: { ...ctx.schema, format: undefined },
  }

  const literal = ctx.nodes.const(withoutTheFormatRange)
  if (literal) {
    hideTheFormatFromTheDefault(ctx.schema)
    return literal
  }

  ctx.chain.current = $(z).attr("number").call().attr("int").call()
  ctx.chain.current = ctx.nodes.min(withoutTheFormatRange) ?? ctx.chain.current
  ctx.chain.current = ctx.nodes.max(withoutTheFormatRange) ?? ctx.chain.current

  const numericStringsToNumbers = $.func()
    .param("v")
    .do(
      $.return(
        $.ternary($.typeofExpr("v").eq($.literal("string")))
          .do($("Number").call("v"))
          .otherwise("v"),
      ),
    )

  hideTheFormatFromTheDefault(ctx.schema)
  return $(z)
    .attr("preprocess")
    .call(numericStringsToNumbers, ctx.chain.current)
}

import type { Plugins } from "@hey-api/openapi-ts"

type ZodNumberResolver = NonNullable<Plugins.Zod.Resolvers["number"]>

export const int64AsNumber: ZodNumberResolver = (ctx) => {
  if (!ctx.utils.shouldCoerceToBigInt(ctx.schema.format)) return undefined

  const { $ } = ctx
  const z = ctx.plugin.imports.z
  const withoutTheFormatRange = {
    ...ctx,
    schema: { ...ctx.schema, format: undefined },
  }

  const literal = ctx.nodes.const(withoutTheFormatRange)
  if (literal) return literal

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

  return $(z).attr("preprocess").call(numericStringsToNumbers, ctx.chain.current)
}

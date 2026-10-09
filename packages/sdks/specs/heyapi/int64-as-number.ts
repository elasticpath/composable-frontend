import type { Plugins } from "@hey-api/openapi-ts"

type ZodNumberResolver = NonNullable<Plugins.Zod.Resolvers["number"]>

export const int64AsNumber: ZodNumberResolver = (ctx) => {
  if (!ctx.utils.shouldCoerceToBigInt(ctx.schema.format)) return undefined

  const withoutTheFormatRange = {
    ...ctx,
    schema: { ...ctx.schema, format: undefined },
  }

  const literal = ctx.nodes.const(withoutTheFormatRange)
  if (literal) return literal

  ctx.chain.current = ctx
    .$(ctx.plugin.imports.z)
    .attr("coerce")
    .attr("number")
    .call()
    .attr("int")
    .call()
  ctx.chain.current = ctx.nodes.min(withoutTheFormatRange) ?? ctx.chain.current
  ctx.chain.current = ctx.nodes.max(withoutTheFormatRange) ?? ctx.chain.current
  return ctx.chain.current
}

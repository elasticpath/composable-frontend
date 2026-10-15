import { z } from "zod"
import type {
  EndpointOperation,
  OperationBindings,
  OperationFacts,
} from "../types"

const int64 = (bounds: z.ZodNumber) =>
  z.preprocess((v) => (typeof v === "string" ? Number(v) : v), bounds)

export const zMoney = z.object({
  amount: int64(z.number().int()).register(z.globalRegistry, {
    description: "The amount in the currency's smallest unit.",
  }),
  currency: z.string(),
})

export const zWidget = z.object({
  id: z.string(),
  name: z.string(),
  price: zMoney,
})

export const zListWidgetsQuery = z.object({
  filter: z.string().optional(),
  "page[limit]": int64(z.number().int().gte(1))
    .register(z.globalRegistry, {
      description: "The maximum number of records per page.",
    })
    .optional(),
  "page[offset]": int64(z.number().int().gte(0).lte(10000)).optional(),
})

export const zListWidgetsHeaders = z.object({
  Authorization: z.string(),
  "accept-language": z.string().optional(),
})

export const zListWidgetsResponse = z.object({ data: z.array(zWidget) })

export const zCreateWidgetBody = z.object({
  name: z.string().register(z.globalRegistry, {
    description: "The widget's display name.",
  }),
  price: zMoney,
  cost: zMoney.optional(),
})

export const zWidgetPath = z.object({ widget_id: z.string() })

export const zWidgetResponse = z.object({ data: zWidget })

export const zDeleteWidgetResponse = z.void()

const noCall: OperationBindings["fn"] = async () => ({ data: {} })

function facts(
  overrides: Partial<OperationFacts> & Pick<OperationFacts, "id">,
): OperationFacts {
  return {
    method: "GET",
    path: "/widgets",
    title: "A widget operation",
    description: "Does something with widgets.",
    risk: "read",
    idempotent: true,
    paging: null,
    deprecated: false,
    agentUnsafe: false,
    requiredSections: [],
    ...overrides,
  }
}

export function widgetOperations(
  fn: OperationBindings["fn"] = noCall,
): EndpointOperation[] {
  return [
    {
      facts: facts({
        id: "widgets.listWidgets",
        title: "List widgets",
        paging: { limit: "page[limit]", offset: "page[offset]" },
      }),
      bindings: {
        fn,
        headers: zListWidgetsHeaders,
        query: zListWidgetsQuery,
        response: zListWidgetsResponse,
      },
    },
    {
      facts: facts({
        id: "widgets.createWidget",
        method: "POST",
        title: "Create a widget",
        risk: "create",
        idempotent: false,
        requiredSections: ["body"],
      }),
      bindings: { fn, body: zCreateWidgetBody, response: zWidgetResponse },
    },
    {
      facts: facts({
        id: "widgets.getWidgetByID",
        path: "/widgets/{widget_id}",
        title: "Get a widget",
        requiredSections: ["path"],
      }),
      bindings: { fn, path: zWidgetPath, response: zWidgetResponse },
    },
    {
      facts: facts({
        id: "widgets.updateWidget",
        method: "PUT",
        path: "/widgets/{widget_id}",
        title: "Update a widget",
        risk: "update",
        requiredSections: ["path", "body"],
      }),
      bindings: {
        fn,
        path: zWidgetPath,
        body: zCreateWidgetBody,
        response: zWidgetResponse,
      },
    },
    {
      facts: facts({
        id: "widgets.deleteWidget",
        method: "DELETE",
        path: "/widgets/{widget_id}",
        title: "Delete a widget",
        risk: "delete",
        requiredSections: ["path"],
      }),
      bindings: { fn, path: zWidgetPath, response: zDeleteWidgetResponse },
    },
  ]
}

export function widgetOperation(
  id: string,
  fn?: OperationBindings["fn"],
): EndpointOperation {
  const found = widgetOperations(fn).find((op) => op.facts.id === id)
  if (!found) throw new Error(`No widget fixture ${id}`)
  return found
}

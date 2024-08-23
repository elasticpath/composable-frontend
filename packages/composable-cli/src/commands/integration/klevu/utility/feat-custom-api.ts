import { EpccRequester } from "../../../../util/command"
import { z } from "zod"

export type GetAllCustomApiResponse = z.infer<
  typeof getAllCustomApiResponseSchema
>
export type CustomApi = GetAllCustomApiResponse["data"][0]

export async function fetchCustomApi(
  requester: EpccRequester,
  slug: string,
): Promise<CustomApi | null> {
  const customApisRawResponse = await requester(
    `/v2/settings/extensions/custom-apis?filter=eq(slug,${slug})`,
  ).then((val) => {
    return val.json()
  })

  const parsedResponse = getAllCustomApiResponseSchema.safeParse(
    customApisRawResponse,
  )

  if (!parsedResponse.success) {
    throw new Error(
      `Failed to parse custom api response: ${parsedResponse.error}`,
    )
  }

  return parsedResponse.data.data[0] ?? null
}

const getAllCustomApiResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      type: z.literal("custom_api"),
      name: z.string(),
      description: z.string().optional(),
      slug: z.string(),
      api_type: z.string(),
      meta: z.object({
        timestamps: z.object({
          created_at: z.string(),
          updated_at: z.string(),
        }),
      }),
    }),
  ),
})

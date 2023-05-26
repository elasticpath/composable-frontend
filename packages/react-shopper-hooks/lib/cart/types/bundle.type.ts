import { ProductResponse } from "@moltin/sdk"

export type SelectedOptions = NonNullable<
  ProductResponse["meta"]["bundle_configuration"]
>["selected_options"]

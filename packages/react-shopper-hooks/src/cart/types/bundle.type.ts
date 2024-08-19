import { ProductResponse } from "@elasticpath/js-sdk"

export type SelectedOptions = NonNullable<
  ProductResponse["meta"]["bundle_configuration"]
>["selected_options"]

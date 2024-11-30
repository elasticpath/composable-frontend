import { test } from "@playwright/test";
import { gatewayCheck } from "./gateway-check";
import { adminClient } from "./epcc-admin-client";

export async function gatewayIsEnabled(): Promise<void> {
  test.skip(
    !(await gatewayCheck(adminClient)),
    "Skipping tests because they payment gateway is not enabled.",
  );
}

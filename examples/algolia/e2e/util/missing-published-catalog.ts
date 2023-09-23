import { test } from "@playwright/test";
import { hasPublishedCatalog } from "./has-published-catalog";
import { client } from "./epcc-client";

export async function skipIfMissingCatalog(): Promise<void> {
  test.skip(
    await hasPublishedCatalog(client),
    "Skipping tests because there is no published catalog.",
  );
}

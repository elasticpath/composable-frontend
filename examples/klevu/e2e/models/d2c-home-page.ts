import type { Page } from "@playwright/test";

export interface D2CHomePage {
  readonly page: Page;
  readonly goto: () => Promise<void>;
}

export function createD2CHomePage(page: Page): D2CHomePage {
  return {
    page,
    async goto() {
      await page.goto("/");
    },
  };
}

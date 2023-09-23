import { FrameLocator, Page } from "@playwright/test";

export type FormInputValue = { value: string; fieldType: "input" | "select" };
export type FormInput = Record<string, FormInputValue>;

export async function fillAllFormFields(
  page: Page | FrameLocator,
  input: FormInput,
) {
  const fillers = Object.keys(input).map((key) => {
    return () => fillFormField(page, key, input[key]);
  });

  for (const filler of fillers) {
    await filler();
  }
}

export async function fillFormField(
  page: Page | FrameLocator,
  key: string,
  { value, fieldType }: FormInputValue,
): Promise<void> {
  const locator = page.getByLabel(key);

  switch (fieldType) {
    case "input":
      return locator.fill(value);
    case "select": {
      await locator.selectOption(value);
      return;
    }
  }
}

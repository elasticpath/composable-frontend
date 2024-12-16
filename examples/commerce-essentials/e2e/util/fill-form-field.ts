import { FrameLocator, Page } from "@playwright/test";

export type FormInputValue = {
  value: string;
  fieldType: "input" | "select" | "combobox";
  options?: { exact?: boolean };
};
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
  { value, fieldType, options }: FormInputValue,
): Promise<void> {
  let locator;
  if (fieldType === "combobox") {
    locator = page.getByRole("combobox");
  } else {
    locator = page.getByLabel(key, { exact: true, ...options });
  }

  switch (fieldType) {
    case "input":
      return locator.fill(value);
    case "select": {
      await locator.selectOption(value);
      return;
    }
    case "combobox": {
      await locator.click();
      await page.getByLabel(value).click();
      return;
    }
  }
}

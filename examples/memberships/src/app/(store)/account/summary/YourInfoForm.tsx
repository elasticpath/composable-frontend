"use client";

import { updateAccount } from "./actions";
import { Label } from "../../../../components/label/Label";
import { Input } from "../../../../components/input/Input";
import { FormStatusButton } from "../../../../components/button/FormStatusButton";
import { useState } from "react";

export function YourInfoForm({
  accountId,
  defaultValues,
}: {
  accountId: string;
  defaultValues?: { name?: string; email?: string };
}) {
  const [error, setError] = useState<string | undefined>(undefined);

  async function updateAccountAction(formData: FormData) {
    const result = await updateAccount(formData);

    if (result && "error" in result) {
      setError(result.error);
    }
  }

  return (
    <form
      className="flex flex-col self-stretch gap-5"
      action={updateAccountAction}
    >
      <fieldset className="flex flex-col self-stretch gap-5">
        <legend className="sr-only">Your information</legend>
        <p>
          <Label htmlFor="accountName">Your name</Label>
          <Input
            id="accountName"
            name="name"
            type="text"
            defaultValue={defaultValues?.name}
          />
        </p>
        <p>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="username"
            type="text"
            defaultValue={defaultValues?.email}
          />
        </p>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </fieldset>
      <section>
        <FormStatusButton variant="secondary">Save changes</FormStatusButton>
      </section>
      <input name="id" type="hidden" readOnly defaultValue={accountId} />
    </form>
  );
}

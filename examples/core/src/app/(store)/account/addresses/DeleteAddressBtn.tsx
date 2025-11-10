"use client";

import { deleteAddress } from "./actions";
import { FormStatusButton } from "../../../../components/button/FormStatusButton";
import { TrashIcon } from "@heroicons/react/24/outline";
import React from "react";

export function DeleteAddressBtn({ addressId }: { addressId: string }) {
  return (
    <form
      className="relative flex-1"
      action={async (formData) => {
        await deleteAddress(formData);
      }}
    >
      <input id="addressId" name="addressId" type="hidden" value={addressId} />
      <FormStatusButton
        type="submit"
        size="small"
        variant="secondary"
        icon={<TrashIcon className="mr-2 h-3.5 w-3.5" />}
      >
        Delete
      </FormStatusButton>
    </form>
  );
}

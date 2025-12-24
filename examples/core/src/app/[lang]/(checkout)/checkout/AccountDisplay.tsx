"use client";

import { Button } from "src/components/button/Button";
import { FormControl, FormField } from "src/components/form/Form";
import { Input } from "src/components/input/Input";
import React, { useEffect, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { CheckoutForm as CheckoutFormSchemaType } from "src/components/checkout/form-schema/checkout-form-schema";
import { logout } from "../../(auth)/actions";
import { Skeleton } from "src/components/skeleton/Skeleton";
import { AccountMemberResponse } from "@epcc-sdk/sdks-shopper";
import { useParams, usePathname } from "next/navigation";

export function AccountDisplay({
  accountMember,
}: {
  accountMember: AccountMemberResponse;
}) {
  const { lang } = useParams();
  const pathname = usePathname();
  const { control, setValue } = useFormContext<CheckoutFormSchemaType>();

  const [_isPending, startTransition] = useTransition();

  useEffect(() => {
    if (accountMember?.email && accountMember?.name) {
      setValue("account", {
        email: accountMember.email,
        name: accountMember.name,
      });
    }
  }, [accountMember, setValue]);

  return (
    <div className="flex flex-row flex-wrap p-5 border border-black/10 rounded-md">
      <div className="flex flex-col flex-1">
        {accountMember ? (
          <>
            <span>{accountMember?.name}</span>
            <span>{accountMember?.email}</span>
          </>
        ) : (
          <div className="flex flex-col gap-1 pr-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        )}
      </div>
      <Button
        variant="link"
        className="text-sm font-normal underline flex-none p-0 self-start"
        onClick={() => startTransition(() => logout(lang as string, pathname))}
      >
        Sign Out
      </Button>
      {accountMember && (
        <>
          <FormField
            control={control}
            defaultValue={accountMember?.email}
            name="account.email"
            render={({ field }) => (
              <FormControl>
                <Input
                  className="hidden"
                  {...field}
                  hidden
                  aria-label="Email Address"
                />
              </FormControl>
            )}
          />
          <FormField
            control={control}
            defaultValue={accountMember?.name}
            name="account.name"
            render={({ field }) => (
              <FormControl>
                <Input className="hidden" {...field} hidden aria-label="Name" />
              </FormControl>
            )}
          />
        </>
      )}
    </div>
  );
}

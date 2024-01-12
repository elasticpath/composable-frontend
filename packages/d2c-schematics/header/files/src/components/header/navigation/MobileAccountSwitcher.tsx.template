"use client";

import { selectedAccount } from "../../../app/(auth)/actions";
import { CheckCircleIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import {
  accountMemberQueryKeys,
  useAuthedAccountMember,
} from "@elasticpath/react-shopper-hooks";
import { SwitchButton } from "../account/switch-button";
import { useQueryClient } from "@tanstack/react-query";
import { Separator } from "../../separator/Separator";

export function MobileAccountSwitcher() {
  const { data, accountMemberTokens, selectedAccountToken } =
    useAuthedAccountMember();

  const client = useQueryClient();

  if (!data || !accountMemberTokens) {
    return null;
  }

  const selectedAccountId = selectedAccountToken?.account_id;

  async function selectedAccountAction(formData: FormData) {
    await selectedAccount(formData);
    await client.invalidateQueries({
      queryKey: accountMemberQueryKeys.details(),
    });
  }

  return Object.keys(accountMemberTokens).length > 1 ? (
    <div>
      <Separator />
      <span className="text-[0.625rem] uppercase font-medium px-2">
        Use store as...
      </span>
      {Object.keys(accountMemberTokens).map((tokenKey) => {
        const value = accountMemberTokens[tokenKey];
        const Icon =
          selectedAccountId === value.account_id
            ? CheckCircleIcon
            : UserCircleIcon;
        return (
          <form key={value.account_id} action={selectedAccountAction}>
            <input
              id="accountId"
              readOnly
              name="accountId"
              type="text"
              className="hidden"
              value={value.account_id}
            />
            <SwitchButton
              type="submit"
              className={`${
                selectedAccountId === value.account_id
                  ? "bg-brand-highlight/10"
                  : "text-gray-900"
              } group flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-brand-primary hover:text-white transition-color ease-in-out duration-100`}
              icon={<Icon className="mr-2 h-5 w-5" aria-hidden="true" />}
            >
              {value.account_name}
            </SwitchButton>
          </form>
        );
      })}
    </div>
  ) : null;
}

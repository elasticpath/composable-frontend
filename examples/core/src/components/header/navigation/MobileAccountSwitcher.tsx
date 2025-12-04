"use client";

import { selectedAccount } from "../../../app/[lang]/(auth)/actions";
import { CheckCircleIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { SwitchButton } from "../account/switch-button";
import { Separator } from "../../separator/Separator";
import { AccountMemberResponse } from "@epcc-sdk/sdks-shopper";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "../../../lib/retrieve-account-member-credentials";
import { useParams } from "next/navigation";

export function MobileAccountSwitcher({
  account,
  accountMemberTokens,
}: {
  account: AccountMemberResponse;
  accountMemberTokens: NonNullable<
    ReturnType<typeof retrieveAccountMemberCredentials>
  >;
}) {
  const { lang } = useParams();
  if (!account || !accountMemberTokens) {
    return null;
  }

  const selectedAccountId = getSelectedAccount(accountMemberTokens)?.account_id;

  async function selectedAccountAction(formData: FormData) {
    await selectedAccount(formData);
  }

  return Object.keys(accountMemberTokens).length > 1 ? (
    <div>
      <Separator />
      <span className="text-[0.625rem] uppercase font-medium px-2">
        Use store as...
      </span>
      {Object.keys(accountMemberTokens.accounts).map((tokenKey) => {
        const value =
          accountMemberTokens.accounts[
            tokenKey as keyof typeof accountMemberTokens
          ]!;

        const Icon =
          selectedAccountId === value.account_id
            ? CheckCircleIcon
            : UserCircleIcon;
        return (
          <form key={value.account_id} action={selectedAccountAction}>
            <input type="hidden" name="lang" value={lang} />
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

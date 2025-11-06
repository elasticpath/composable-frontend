"use server";
import Link from "next/link";
import EpIcon from "../../icons/ep-icon";
import { MobileNavBarButton } from "./MobileNavBarButton";
import { buildSiteNavigation } from "../../../lib/build-site-navigation";
import { CartSheet } from "../../cart/CartSheet";
import { createElasticPathClient } from "../../../lib/create-elastic-path-client";
import { cookies } from "next/headers";
import {
  ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  CART_COOKIE_NAME,
} from "../../../lib/cookie-constants";
import {
  getACart,
  getV2AccountMembersAccountMemberId,
} from "@epcc-sdk/sdks-shopper";
import { Suspense } from "react";
import { Skeleton } from "../../skeleton/Skeleton";
import { retrieveAccountMemberCredentials } from "../../../lib/retrieve-account-member-credentials";
import { TAGS } from "../../../lib/constants";

export default async function MobileNavBar() {
  const client = await createElasticPathClient();
  const nav = await buildSiteNavigation(client);
  const cartId = (await cookies()).get(CART_COOKIE_NAME)?.value;

  if (!cartId) {
    console.error("MobileNavBar cart cookie not found");
    return null;
  }

  const cart = await getACart({
    client,
    path: {
      cartID: cartId,
    },
    query: {
      include: ["items"],
    },
    next: {
      tags: [TAGS.cart],
    },
  });

  if (!cart.data) {
    console.error("No cart found");
    return null;
  }

  const accountMemberCookie = retrieveAccountMemberCredentials(
    await cookies(),
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  const accountMember = accountMemberCookie?.accountMemberId
    ? await getV2AccountMembersAccountMemberId({
        client,
        path: {
          accountMemberID: accountMemberCookie.accountMemberId,
        },
      })
    : undefined;

  return (
    <div>
      <div className="flex w-full items-center justify-between md:hidden">
        <div className="grid w-full grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center">
            <MobileNavBarButton
              nav={nav}
              account={accountMember?.data?.data}
              accountMemberTokens={accountMemberCookie}
            />
          </div>
          <Link href="/" aria-label="Go to home page">
            <EpIcon className="min-w-10 relative h-10 w-10" />
          </Link>
          <div className="justify-self-end">
            <div className="flex gap-4">
              <Suspense fallback={<Skeleton className="h-10 w-10" />}>
                {cart.data && <CartSheet cart={cart.data} />}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import {initializeShopperClient} from "@/lib/epcc-shopper-client";
import {getV2Accounts} from "@epcc-sdk/sdks-shopper";
import {cookies} from "next/headers";
import {ACCOUNT_MEMBER_TOKEN_COOKIE_KEY} from "@/app/constants";
import Stripe from "stripe";

initializeShopperClient()

export async function POST() {
    const cookieStore = await cookies();
    const accountToken = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_KEY)?.value;
    if (!accountToken) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const accountDataResponse = await getV2Accounts({
        headers: {
            'EP-Account-Management-Authentication-Token': accountToken
        }
    })

    if (accountDataResponse.error) {
        return Response.json({ error: "Failed to fetch account data" }, { status: 500 });
    }

    const accountData = accountDataResponse.data?.data?.[0]
    const stripeCustomerId = (accountData as unknown as { 'stripe-account-id': string })?.['stripe-account-id']

    if (!stripeCustomerId) {
        return Response.json({ error: "No Stripe customer found for this account" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_RESTRICTED_KEY!, {
        stripeAccount: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID!,
    });

    const setupIntent = await stripe.setupIntents.create(
        {
            customer: stripeCustomerId,
            automatic_payment_methods: { enabled: true },
            usage: 'off_session',
        },
        { stripeAccount: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID! }
    )

    return Response.json({ clientSecret: setupIntent.client_secret });
}

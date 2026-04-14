'use server';
import { revalidatePath } from 'next/cache';
import {createSubscriptionState, getV2Accounts, createAnAccessToken, client} from "@epcc-sdk/sdks-shopper"
import {initializeShopperClient} from "@/lib/epcc-shopper-client";
import {cookies} from "next/headers";
import {ACCOUNT_MEMBER_TOKEN_COOKIE_KEY} from "@/app/constants";

export async function cancelSubscription(subscriptionId: string, formData: FormData) {
    initializeShopperClient()

    const stateUpdateResponse = await createSubscriptionState({
        path: {
            subscription_uuid: subscriptionId
        },
        body: {
            data: {
                type: 'subscription_state',
                attributes: {
                    action: 'cancel'
                }
            }
        }
    })

    if (stateUpdateResponse.error) {
        console.error('Failed to update subscription state:', stateUpdateResponse.error);
        throw new Error('Failed to cancel subscription');
    }

    revalidatePath('/account');
}

export async function updateSubscriptionPaymentAuthority(subscriptionId: string, paymentMethodId: string) {
    initializeShopperClient()
    const cookieStore = await cookies()
    const accountToken = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_KEY)?.value
    if (!accountToken) throw new Error('Not authenticated')

    const accountDataResponse = await getV2Accounts({
        headers: { 'EP-Account-Management-Authentication-Token': accountToken }
    })
    if (accountDataResponse.error) throw new Error('Failed to fetch account data')

    const accountData = accountDataResponse.data?.data?.[0]
    const stripeCustomerId = (accountData as unknown as { 'stripe-account-id': string })?.['stripe-account-id']
    if (!stripeCustomerId) throw new Error('No Stripe customer found for this account')

    const clientCredentialsToken = await createAnAccessToken({
        body: {
            grant_type: 'client_credentials',
            client_id: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID!,
            client_secret: process.env.EPCC_CLIENT_SECRET!,
        }
    })
    if (clientCredentialsToken.error) throw new Error('Failed to create client credentials token')

    const baseUrl = client.getConfig().baseUrl
    const patchResponse = await fetch(`${baseUrl}/v2/subscriptions/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${clientCredentialsToken.data.access_token}`,
        },
        body: JSON.stringify({
            data: {
                id: subscriptionId,
                type: 'subscription',
                attributes: {
                    payment_authority: {
                        type: 'elastic_path_payments_stripe',
                        customer_id: stripeCustomerId,
                        card_id: paymentMethodId,
                    }
                }
            }
        })
    })
    if (!patchResponse.ok) {
        const errorText = await patchResponse.text()
        console.error('Failed to update payment authority:', patchResponse.status, errorText)
        throw new Error('Failed to update payment method')
    }
    revalidatePath('/account')
}
import {initializeShopperClient} from "@/lib/epcc-shopper-client";
import {
    createAnAccessToken,
    createCartPaymentIntent,
    getV2AccountMembers,
    getV2Accounts,
    checkoutApi,
    confirmOrder,
    getACart,
    deleteACart, createACart,
    deleteAccountCartAssociation,
    createAccountCartAssociation, postV2AccountMembersTokens, listSubscriptions
} from "@epcc-sdk/sdks-shopper"
import {cookies} from "next/headers";
import {ACCOUNT_MEMBER_TOKEN_COOKIE_KEY, CART_COOKIE_KEY, EPCC_ENDPOINT_URL} from "@/app/constants";
import {NextResponse} from "next/server";

initializeShopperClient()

async function pollForSubscriptions(
    expectedOfferingIds: string[],
    options = { initialDelayMs: 500, maxAttempts: 6, backoffMultiplier: 2, maxDelayMs: 8000 }
): Promise<boolean> {
    const { initialDelayMs, maxAttempts, backoffMultiplier, maxDelayMs } = options;
    let delay = initialDelayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, delay));

        const result = await listSubscriptions({});

        if (!result.error && result.data?.data) {
            const subs = result.data.data;
            const allFound = expectedOfferingIds.every(offeringId =>
                subs.some((sub: any) => sub.attributes?.offering?.id === offeringId)
            );
            if (allFound) return true;
        }

        delay = Math.min(delay * backoffMultiplier, maxDelayMs);
    }

    return false;
}

interface RequestData {
    confirmationTokenId: string;
    customer?: {
        email: string;
        name: string;
    };
    billingAddress: {
        first_name: string;
        last_name: string;
        line_1: string;
        line_2?: string;
        city: string;
        region?: string;
        postcode: string;
        country: string;
    };
}

export async function POST(request: Request) {
    const req: RequestData = await request.json()

    // Resolve cookies for cart id, account token
    const cookieStore = await cookies();

    const cartId = cookieStore.get(CART_COOKIE_KEY)?.value;
    if (!cartId) {
        return Response.json({ error: "No cart found" }, { status: 400 });
    }
    const accountToken = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_KEY)?.value;
    if (!accountToken) {
        return Response.json({ error: "No account token found" }, { status: 401 });
    }

    const memberResponse = await getV2AccountMembers({
        headers: {
            'EP-Account-Management-Authentication-Token': accountToken
        }
    });

    if (memberResponse.error) {
        return Response.json({ error: "Failed to fetch member data" }, { status: 500 });
    }

    const accountDataResponse = await getV2Accounts({
        headers: {
            'EP-Account-Management-Authentication-Token': accountToken
        }
    })

    if (accountDataResponse.error) {
        return Response.json({ error: "Failed to fetch account data" }, { status: 500 });
    }

    const memberData = memberResponse.data?.data?.[0];
    const accountData = accountDataResponse.data?.data?.[0];

    // Retrieve the Stripe customer ID from account data
    const stripeCustomerId = (accountData as unknown as { 'stripe-account-id': string })?.['stripe-account-id'];

    // 0. create a client credentials shopper client
    const clientCredentialsToken = await createAnAccessToken({
        body: {
            grant_type: "client_credentials",
            client_id: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID!,
            client_secret: process.env.EPCC_CLIENT_SECRET!,
        },
    })

    if (clientCredentialsToken.error) {
        return Response.json({ error: "Failed to create client credentials token" }, { status: 500 });
    }

    /**
     * 1. Set payment intent on cart
      */
    const paymentResult = await createCartPaymentIntent({
        path: {
            cartID: cartId,
        },
        headers: {
            'Authorization': `Bearer ${clientCredentialsToken.data.access_token}`,
        },
        body: {
            data: {
                gateway: "elastic_path_payments_stripe",
                method: "purchase",
                options: {
                    automatic_payment_methods: { enabled: true },
                    // @ts-expect-error sdk does not have the correct type for this
                    confirm: true,
                    confirmation_token: req.confirmationTokenId,
                    receipt_email: memberData?.email,
                    customer: stripeCustomerId,
                    // Not handling redirects as part of this example
                    return_url: "https://placeholder.com",
                    setup_future_usage: "off_session",
                }
            }
        }
    })

    if (paymentResult.error) {
        const status = paymentResult.response?.status ?? 500;
        const errors = (paymentResult.error as any)?.errors;
        const firstError = Array.isArray(errors) ? errors[0] : paymentResult.error;
        const detail = firstError?.detail ?? (firstError as any)?.message ?? "An error occurred processing your payment";
        return Response.json({ error: detail }, { status });
    }

    /**
     * 2. Perform checkout to turn cart into order
      */
    const checkoutResponse = await checkoutApi({
        path: {
            cartID: cartId,
        },
        body: {
            data: {
                account: {
                    id: accountData?.id,
                    member_id: memberData?.id
                },
                contact: {
                    email: memberData?.email,
                    name: memberData?.name
                },
                billing_address: {
                    first_name: req.billingAddress.first_name,
                    last_name: req.billingAddress.last_name,
                    line_1: req.billingAddress.line_1,
                    line_2: req.billingAddress.line_2 ?? '',
                    city: req.billingAddress.city,
                    region: req.billingAddress.region ?? '',
                    postcode: req.billingAddress.postcode,
                    country: req.billingAddress.country,
                    company_name: "",
                    county: "",
                },
                shipping_address: {
                    first_name: req.billingAddress.first_name,
                    last_name: req.billingAddress.last_name,
                    line_1: req.billingAddress.line_1,
                    line_2: req.billingAddress.line_2 ?? '',
                    city: req.billingAddress.city,
                    region: req.billingAddress.region ?? '',
                    postcode: req.billingAddress.postcode,
                    country: req.billingAddress.country,
                    company_name: "",
                    county: "",
                    phone_number: "",
                    instructions: ""
                }
            }
        }
    })

    if (checkoutResponse.error) {
        return Response.json({ error: "Failed to checkout" }, { status: 500 });
    }

    /**
     * 3. Confirm the order paid to sync with Elastic Path Payments
      */

    const orderId = checkoutResponse.data.data?.id!;
    const orderConfirmationResponse = await confirmOrder({
        path: {
            orderID: orderId,
        },
        // @ts-expect-error the body is not typed correctly in the SDK
        body: {
            data: {
                options: {
                    metadata: {
                        order_id: orderId,
                        "statement_descriptor": "Confirmed intent"
                    }
                }
            }
        }
    })

    if (orderConfirmationResponse.error) {
        return Response.json({ error: "Failed to confirm order" }, { status: 500 });
    }

    const cartResponse = await getACart({
        path: {
            cartID: cartId,
        },
        query: {
            include: ['items']
        }
    })

    if (cartResponse.error) {
        return Response.json({ error: "Failed to fetch cart" }, { status: 500 });
    }

    /**
     * 4. clear the cart
      */

    const dissociateResponse = await deleteAccountCartAssociation({
        path: {
            cartID: cartId,
        },
        body: {
                data: [
                    {
                        id: accountData?.id,
                        type: "account"
                    }
                ]
        }
    })

    if (dissociateResponse.error) {
        console.error("Failed to dissociate cart from account", JSON.stringify(dissociateResponse.error));
        return Response.json({ error: "Failed to dissociate cart from account" }, { status: 500 });
    }

    const deleteCartResponse = await deleteACart({
        path: {
            cartID: cartId
        },
    })

    if (deleteCartResponse.error) {
        console.error("Failed to delete cart", JSON.stringify(deleteCartResponse.error));
        // Looks to be a race condition in the API where cart is not yet dissociated
        // return Response.json({ error: "Failed to delete cart" }, { status: 500 });
    }

    /**
     * 5. set new cart cookie
     */

    const createdCart = await createACart({
        baseUrl: EPCC_ENDPOINT_URL,
        headers: {
            Authorization: `Bearer ${clientCredentialsToken.data.access_token!}`,
        },
        body: {
            data: {
                name: "Cart",
            },
        },
    });

    if (createdCart.error) {
        return Response.json({ error: "Failed to create new cart" }, { status: 500 });
    }

    const associateResponse = await createAccountCartAssociation({
        headers: {
            Authorization: `Bearer ${clientCredentialsToken.data.access_token!}`,
        },
        path: {
            cartID: createdCart.data?.data.id!
        },
        body: {
            data: [
                {
                    type: "account",
                    id: accountData?.id
                }
            ]
        }
    })

    if (associateResponse.error) {
        return Response.json({ error: "Failed to associate new cart with account" }, { status: 500 });
    }

    const res = NextResponse.json({ successUrl: new URL(`/checkout/success/${orderId}`, request.url).toString() }, { status: 200 });

    res.cookies.set(
        CART_COOKIE_KEY,
        createdCart.data?.data?.id!,
        {
            sameSite: "strict",
            expires: new Date(
                (createdCart.data?.data?.meta?.timestamps as any)?.expires_at
            ),
        }
    );

    // Poll until newly created subscriptions appear, confirming entitlements are ready
    const expectedOfferingIds = ((cartResponse.data?.included?.items ?? []) as any[])
        .filter((item) => item.type === 'subscription_item')
        .map((item) => item.subscription_offering_id)
        .filter(Boolean) as string[];

    if (expectedOfferingIds.length > 0) {
        const propagated = await pollForSubscriptions(expectedOfferingIds);
        if (!propagated) {
            return Response.json({ error: "Request timed out, please try again later." }, { status: 503 });
        }
    }

    const response = await postV2AccountMembersTokens({
        headers: {
            'EP-Account-Management-Authentication-Token': accountToken
        },
        body: {
            data: {
                type: "account_management_authentication_token",
                authentication_mechanism: "account_management_authentication_token",
            }
        }
    })

    if (response.error) {
        console.error(response.error);
        return Response.json({ error: "There was an error creating your account. Please try again." }, { status: 500 });
    }

    // set the token on a cookie
    const account = response.data?.data?.[0]
    const expires = response.data?.data?.[0].expires
    if (!account || !expires) {
        return Response.json({ error: "Refresh of account token did not contain token or expiration" }, { status: 500 });
    }

    cookieStore.set({
        name: ACCOUNT_MEMBER_TOKEN_COOKIE_KEY,
        value: JSON.stringify({
            accounts: response.data?.data?.reduce((acc, item) => {
                return {
                    ...acc,
                    [item.account_id!]: item
                }
            }, {}),
            selected: account.account_id,
            accountMemberId: response.data.meta?.account_member_id
        }),
        httpOnly: true,
        // @ts-ignore expires is typed incorrectly in the SDK it's infact an ISO8601 string
        expires: new Date(expires * 1000), // Convert seconds to milliseconds
        path: '/',
    })

    return res;
}

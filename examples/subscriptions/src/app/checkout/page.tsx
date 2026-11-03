import {CheckoutElements} from "@/app/checkout/CheckoutElements";
import {initializeShopperClient} from "@/lib/epcc-shopper-client";
import {cookies} from "next/headers";
import {CART_COOKIE_KEY, ACCOUNT_MEMBER_TOKEN_COOKIE_KEY} from "@/app/constants";
import {getACart, getV2AccountMembers} from "@epcc-sdk/sdks-shopper";
import {redirect} from "next/navigation";

initializeShopperClient()

async function getUserData(token: string) {
    try {
        const response = await getV2AccountMembers({
            headers: {
                'EP-Account-Management-Authentication-Token': token
            }
        });
        
        if (response.error) {
            console.error('Failed to fetch user data:', response.error);
            return null;
        }
        
        return response.data?.data?.[0] || null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

export default async function CheckoutPage() {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE_KEY)?.value;
    const authToken = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_KEY)?.value;

    if (!cartId) {
        throw new Error("No cart found");
    }

    const response = await getACart({
        path: { cartID: cartId },
        query: {
            include: ['items', 'tax_items', 'custom_discounts', 'promotions'] as const
        }
    });

    if (response.error) {
        throw new Error("Failed to fetch cart");
    }

    if (!response.data.included?.items || response.data.included.items.length === 0) {
        redirect("/cart")
    }

    // Fetch user data if authenticated
    let userData = null;
    if (authToken) {
        userData = await getUserData(authToken);
    }

    return (
        <CheckoutElements cart={response.data} userData={userData} isAuthenticated={!!authToken} />
    )
}
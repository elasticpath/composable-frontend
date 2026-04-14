import Image from "next/image";
import Link from "next/link";
import {getACart, getOffering} from "@epcc-sdk/sdks-shopper";
import {initializeShopperClient} from "@/lib/epcc-shopper-client";
import {cookies} from "next/headers";
import {CART_COOKIE_KEY} from "@/app/constants";

import Footer from "../../components/footer/Footer";
import CartItemActions from "./CartItemActions";
import { processDescription } from "../utils/text";
import { getPlanById, getPricingOptionById, formatPricingOptionInterval } from "@/lib/offering-helpers";

initializeShopperClient()
export default async function CartPage() {

    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE_KEY)?.value;

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

    const allItems = response.data?.included?.items || [];
    const cartItems = allItems.filter((item: any) => item.type === 'cart_item');
    const subscriptionItems: any[] = allItems.filter((item: any) => item.type === 'subscription_item');
    const promotionItems = allItems.filter((item: any) => item.type === 'promotion_item');
    const isEmpty = cartItems.length === 0 && subscriptionItems.length === 0;
    
    // Fetch offering details for all subscription items
    const subscriptionDetailsMap = new Map();

    console.log("cart: ", allItems);
    
    for (const subscriptionItem of subscriptionItems) {
        try {
            const offeringId = subscriptionItem.subscription_offering_id;
            const planId = subscriptionItem.subscription_configuration?.plan;
            const pricingOptionId = subscriptionItem.subscription_configuration?.pricing_option;
            
            if (offeringId && planId && pricingOptionId) {
                const offeringResponse = await getOffering({
                    path: { offering_uuid: offeringId },
                    query: { include: ['plans', 'pricing_options'] as const }
                });
                
                if (!offeringResponse.error && offeringResponse.data) {
                    const plan = getPlanById(offeringResponse.data, planId);
                    const pricingOption = getPricingOptionById(offeringResponse.data, pricingOptionId);
                    
                    subscriptionDetailsMap.set(subscriptionItem.id, {
                        offeringName: offeringResponse.data.data?.attributes?.name || 'Elastic Path Subscription',
                        planName: plan?.attributes?.name || 'Subscription Plan',
                        pricingOptionName: pricingOption?.attributes?.name || formatPricingOptionInterval(pricingOption!) || 'Billing Option'
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch offering details for subscription:', subscriptionItem.id, error);
        }
    }

    if (isEmpty) {
        return (
            <>

                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-[1200px] mx-auto px-[15px] py-8">
                        <h1 className="text-3xl font-bold mb-8 text-[#0E1521]">Your Cart</h1>
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <div className="mb-6">
                                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold mb-2 text-[#0E1521]">Your cart is empty</h2>
                            <p className="text-gray-600 mb-6">
                                Add some training courses or resources to your cart to get started.
                            </p>
                            <Link
                                href="/"
                                className="inline-block bg-[#2BCC7E] text-black px-6 py-3 rounded-lg hover:bg-[#24b36e] transition-colors font-bold"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-[1200px] mx-auto px-[15px] py-8">
                    <h1 className="text-3xl font-bold mb-8 text-[#0E1521]">Your Cart</h1>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Products Section */}
                            {cartItems.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm">
                                    <div className="p-6 border-b border-gray-200">
                                        <h2 className="text-lg font-semibold text-[#0E1521]">
                                            Products ({cartItems.length}{" "}
                                            {cartItems.length === 1 ? "item" : "items"})
                                        </h2>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-6">
                                            {cartItems.map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 pb-6 border-b border-gray-100 last:border-b-0"
                                            >
                                                {/* Product Image */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                                                        {item.image?.href ? (
                                                            <Image
                                                                src={item.image.href}
                                                                alt={item.name}
                                                                width={96}
                                                                height={96}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                                <span className="text-gray-400 text-xs">
                                                                    No image
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-grow">
                                                    <h3 className="font-semibold text-gray-900 mb-1">
                                                        {item.name}
                                                    </h3>
                                                    {item.description && (
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {processDescription(item.description, 120)}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-between mt-3">
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-lg font-semibold text-[#00A859]">
                                                                {item.meta.display_price.with_tax.unit.formatted}
                                                            </div>

                                                            <CartItemActions 
                                                                itemId={item.id}
                                                                quantity={item.quantity}
                                                            />
                                                        </div>

                                                        {/* Line Total */}
                                                        <div className="text-right">
                                                            <span className="font-semibold text-[#0E1521]">
                                                                {item.meta.display_price.with_tax.value.formatted}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Subscription Items Section */}
                            {subscriptionItems.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm">
                                    <div className="p-6 border-b border-gray-200">
                                        <h2 className="text-lg font-semibold text-[#0E1521]">
                                            Subscriptions ({subscriptionItems.length}{" "}
                                            {subscriptionItems.length === 1 ? "item" : "items"})
                                        </h2>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-6">
                                            {subscriptionItems.map((item: any) => {
                                                const details = subscriptionDetailsMap.get(item.id);
                                                return (
                                                <div
                                                    key={item.id}
                                                    className="flex gap-4 pb-6 border-b border-gray-100 last:border-b-0"
                                                >
                                                    {/* Subscription Icon */}
                                                    <div className="flex-shrink-0">
                                                        <div className="w-24 h-24 bg-[#0E1521] rounded-lg overflow-hidden flex items-center justify-center">
                                                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {/* Subscription Details */}
                                                    <div className="flex-grow">
                                                        <h3 className="font-semibold text-gray-900 mb-1">
                                                            {details?.offeringName || item.name || 'Unknown Subscription'}
                                                        </h3>
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            <div>{details?.planName || 'Unknown Plan'}</div>
                                                            <div className="text-gray-500">{details?.pricingOptionName || 'Unknown Billing Option'}</div>
                                                        </div>
                                                        {item.subscription_configuration && (
                                                            <div className="text-sm text-gray-500">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    Recurring subscription
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between mt-3">
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-lg font-semibold text-[#00A859]">
                                                                    {item.meta?.display_price?.with_tax?.unit?.formatted}
                                                                </div>

                                                                <CartItemActions
                                                                    itemId={item.id}
                                                                    quantity={item.quantity ?? 1}
                                                                />
                                                            </div>

                                                            {/* Line Total */}
                                                            <div className="text-right">
                                                                <span className="font-semibold text-[#0E1521]">
                                                                    {item.meta?.display_price?.with_tax?.value?.formatted}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Promotions Section */}
                            {promotionItems.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm">
                                    <div className="p-6 border-b border-gray-200">
                                        <h2 className="text-lg font-semibold text-[#0E1521]">
                                            Applied Promotions
                                        </h2>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {promotionItems.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0"
                                                >
                                                    {/* Promotion Icon */}
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {/* Promotion Details */}
                                                    <div className="flex-grow">
                                                        <h3 className="font-medium text-gray-900">
                                                            {item.name}
                                                        </h3>
                                                        <p className="text-sm text-green-600">
                                                            Discount Applied
                                                        </p>
                                                    </div>

                                                    {/* Promotion Amount */}
                                                    <div className="text-right">
                                                        <span className="font-semibold text-green-600">
                                                            {item.meta.display_price.with_tax.value.formatted}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cart Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                                <h2 className="text-lg font-semibold mb-4 text-[#0E1521]">Order Summary</h2>

                                <div className="space-y-3 mb-6">
                                    {/* Show original subtotal if there's a discount */}
                                    {response.data?.data?.meta?.display_price?.discount && 
                                     response.data?.data?.meta?.display_price?.discount?.amount !== 0 && (
                                        <div className="flex justify-between">
                                            <span>Original Price</span>
                                            <span className="text-gray-500 line-through">
                                                {response.data?.data?.meta?.display_price?.without_discount?.formatted}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>
                                            {response.data?.data?.meta?.display_price?.without_tax?.formatted}
                                        </span>
                                    </div>

                                    {/* Show discount if present */}
                                    {response.data?.data?.meta?.display_price?.discount && 
                                     response.data?.data?.meta?.display_price?.discount?.amount !== 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span className="font-medium">
                                                {response.data?.data?.meta?.display_price?.discount?.formatted}
                                            </span>
                                        </div>
                                    )}

                                    {response.data?.data?.meta?.display_price?.tax && 
                                     response.data?.data?.meta?.display_price?.tax?.amount !== 0 && (
                                        <div className="flex justify-between">
                                            <span>Tax</span>
                                            <span>{response.data?.data?.meta?.display_price?.tax?.formatted}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total</span>
                                            <span className="text-[#00A859]">
                                                {response.data?.data?.meta?.display_price?.with_tax?.formatted}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Link href="/checkout">
                                    <button
                                        type="button"
                                        className="w-full bg-[#2BCC7E] text-black py-3 px-4 rounded-lg font-bold hover:bg-[#24b36e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Proceed to Checkout
                                    </button>
                                </Link>
                                
                                <Link
                                    href="/"
                                    className="block text-center text-[#0E1521] hover:text-[#002244] mt-4 transition-colors"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_KEY } from "@/app/constants";
import { getV2AccountMembers, getV2Accounts, listSubscriptions, getCustomerOrders } from "@epcc-sdk/sdks-shopper";
import { initializeShopperClient } from "@/lib/epcc-shopper-client";
import CancelSubscriptionButton from "./CancelSubscriptionButton";
import UpdatePaymentMethodButton from "./UpdatePaymentMethodButton";
import SignOutButton from "./SignOutButton";
import { cn } from "@/lib/cn";

import Footer from "../../components/footer/Footer";
import Link from "next/link";

initializeShopperClient();

async function getAccountData(token: string) {
    try {
        const memberResponse = await getV2AccountMembers({
            headers: {
                'EP-Account-Management-Authentication-Token': token
            }
        });

        if (memberResponse.error) {
            console.error('Failed to fetch member data:', memberResponse.error);
            return null;
        }

        const accountResponse = await getV2Accounts({
            headers: {
                'EP-Account-Management-Authentication-Token': token
            }
        });

        if (accountResponse.error) {
            console.error('Failed to fetch account data:', accountResponse.error);
            return null;
        }

        const memberData = memberResponse.data?.data?.[0];
        const accountData = accountResponse.data?.data?.[0];

        return {
            member: memberData,
            account: accountData
        };
    } catch (error) {
        console.error('Error fetching account data:', error);
        return null;
    }
}

export const dynamic = 'force-dynamic';

const statusStyles: Record<string, string> = {
    active: "bg-green-50 text-secondary",
    inactive: "bg-red-50 text-red-800",
    pending: "bg-orange-50 text-[#e65100]",
    paused: "bg-gray-100 text-[#616161]",
    cancelled: "bg-red-50 text-red-800",
    resuming: "bg-blue-50 text-primary",
    unknown: "bg-gray-50 text-[#9e9e9e]",
    suspended: "bg-red-100 text-red-900",
    complete: "bg-green-50 text-secondary",
    processing: "bg-blue-50 text-primary",
    failed: "bg-red-50 text-red-800",
};

function getSubscriptionDisplayInfo(subscription: any) {
    const meta = subscription.meta;
    const status = meta?.status;

    if (meta?.canceled) {
        return { text: 'Cancelled', className: 'cancelled' };
    } else if (meta?.paused) {
        return { text: 'Paused', className: 'paused' };
    } else if (meta?.pending) {
        return { text: 'Pending Activation', className: 'pending' };
    } else if (meta?.suspended) {
        return { text: 'Suspended', className: 'suspended' };
    } else if (status === 'active') {
        return { text: 'Active', className: 'active' };
    }

    return { text: 'Unknown', className: 'unknown' };
}

export default async function AccountPage() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_KEY)?.value;

    if (!authToken) {
        redirect('/login');
    }

    const accountData = await getAccountData(authToken);

    if (!accountData) {
        redirect('/login');
    }

    const subscriptions = await listSubscriptions({
        query: {
            include: ["plans", "pricing_options"]
        }
    })

    const ordersResponse = await getCustomerOrders({
        // @ts-ignore SDK issue - need to update the open api spec to include query params listed
        query: {
            include: ['items'] as const,
            sort: '-created_at' as any,
            page: {
                limit: 10
            }
        }
    });

    const orders = ordersResponse.data?.data || [];
    // @ts-ignore SDK issue - need to update the open api spec to include included.items
    const includedItems = ordersResponse.data?.included?.items || [];

    const ordersWithItems = orders.map((order) => {
        const itemRefs = order.relationships?.items?.data || [];
        const orderItems = itemRefs.map((ref) => {
            return includedItems.find((item: {id: string}) =>
                item.id === ref.id
            );
        }).filter(Boolean);

        return {
            ...order,
            items: orderItems
        };
    });

    return (
        <>
            <div className="max-w-[1200px] mx-auto px-5 py-10 min-h-[calc(100vh-300px)] bg-[#f5f5f5] max-md:px-5 max-md:py-5">
                <div className="flex justify-between items-center mb-8 max-md:flex-col max-md:gap-5 max-md:items-start">
                    <h1 className="text-[2.5rem] font-semibold m-0 text-primary max-md:text-[2rem]">My Account</h1>
                    <SignOutButton />
                </div>

            <div className="grid gap-10">
                {/* Account Details Section */}
                <section className="bg-white p-[30px] rounded-xl border border-[#e0e0e0] shadow-sm max-md:p-5">
                    <h2 className="text-2xl font-semibold mb-6 text-primary">Account Details</h2>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between py-3 border-b border-[#f0f0f0] last:border-b-0 max-md:flex-col max-md:gap-1">
                            <span className="font-medium text-primary">Name:</span>
                            <span className="text-[#333] font-normal">{accountData.member?.name || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-[#f0f0f0] last:border-b-0 max-md:flex-col max-md:gap-1">
                            <span className="font-medium text-primary">Email:</span>
                            <span className="text-[#333] font-normal">{accountData.member?.email}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-[#f0f0f0] last:border-b-0 max-md:flex-col max-md:gap-1">
                            <span className="font-medium text-primary">Account Type:</span>
                            <span className="text-[#333] font-normal">{accountData.account?.type || 'Standard'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b-0 max-md:flex-col max-md:gap-1">
                            <span className="font-medium text-primary">Member Since:</span>
                            <span className="text-[#333] font-normal">
                                {accountData.member?.meta?.timestamps?.created_at
                                    ? new Date(accountData.member.meta.timestamps.created_at).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })
                                    : 'Unknown'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Subscriptions Section */}
                <section className="bg-white p-[30px] rounded-xl border border-[#e0e0e0] shadow-sm max-md:p-5">
                    <h2 className="text-2xl font-semibold mb-6 text-primary">My Subscriptions</h2>

                    {subscriptions.data?.data && subscriptions.data.data.length > 0 ? (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 xl:grid-cols-[repeat(auto-fill,minmax(380px,1fr))] max-md:grid-cols-1 max-[480px]:gap-4">
                            {subscriptions.data.data
                                .sort((a: any, b: any) => {
                                    const dateA = new Date(a.meta?.timestamps?.created_at || 0);
                                    const dateB = new Date(b.meta?.timestamps?.created_at || 0);
                                    return dateB.getTime() - dateA.getTime();
                                })
                                .map((subscription: any) => {
                                const planId = subscription.attributes?.plan_id;
                                const plan = subscriptions.data?.included?.plans?.find((p: any) => p.id === planId);
                                const pricingOptionId = subscription.attributes?.pricing_option_id;
                                const pricingOption = subscriptions.data?.included?.pricing_options?.find((p: any) => p.id === pricingOptionId);

                                let formattedPrice = '£4.99/month';
                                if (pricingOption && plan) {
                                    const priceData = pricingOption.meta?.prices?.[planId];
                                    if (priceData?.display_price?.without_tax?.formatted) {
                                        formattedPrice = priceData.display_price.without_tax.formatted;
                                    } else if (priceData?.display_price?.with_tax?.formatted) {
                                        formattedPrice = priceData.display_price.with_tax.formatted;
                                    }
                                    const interval = pricingOption.attributes?.billing_interval_type || 'month';
                                    const frequency = pricingOption.attributes?.billing_frequency || 1;
                                    const intervalText = frequency === 1 ? interval : `${frequency} ${interval}s`;
                                    formattedPrice = `${formattedPrice}/${intervalText}`;
                                }

                                const displayInfo = getSubscriptionDisplayInfo(subscription);

                                return (
                                    <div key={subscription.id} className="bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg p-6 transition-shadow duration-200 flex flex-col h-full hover:shadow-md max-[480px]:p-4">
                                        <div className="flex justify-between items-center mb-4 max-md:flex-col max-md:items-start max-md:gap-2">
                                            <h3 className="text-xl font-semibold text-primary m-0">
                                                {plan?.attributes?.name}
                                            </h3>
                                            <span className={cn(
                                                "px-3 py-1 rounded-[20px] text-sm font-medium uppercase",
                                                statusStyles[displayInfo.className] || statusStyles.unknown
                                            )}>
                                                {displayInfo.text}
                                            </span>
                                        </div>

                                        <div className="mb-5">
                                            <p className="text-2xl font-semibold text-secondary m-0 mb-2">{formattedPrice}</p>
                                            {subscription.meta?.status === 'active' && !subscription.meta?.canceled && !subscription.meta?.paused && subscription.meta?.invoice_after && (
                                                <p className="text-sm text-muted m-0">
                                                    Next billing: {new Date(subscription.meta.invoice_after).toLocaleDateString('en-GB')}
                                                </p>
                                            )}
                                            {subscription.meta?.pending && subscription.attributes?.go_live_after && (
                                                <p className="text-sm text-muted m-0">
                                                    Starts: {new Date(subscription.attributes.go_live_after).toLocaleDateString('en-GB')}
                                                </p>
                                            )}
                                        </div>

                                        {plan?.attributes?.description && (
                                            <div className="mb-4 p-3 bg-[rgba(0,168,89,0.05)] rounded-md grow">
                                                <p className="m-0 text-[0.95rem] text-muted leading-relaxed">{plan.attributes.description}</p>
                                            </div>
                                        )}

                                        {subscription.meta?.status === 'active' && !subscription.meta?.canceled && !subscription.meta?.paused && (
                                            <div className="flex flex-col gap-3 mt-auto">
                                                <UpdatePaymentMethodButton subscriptionId={subscription.id} />
                                                <CancelSubscriptionButton subscriptionId={subscription.id} />
                                            </div>
                                        )}

                                        {subscription.meta?.paused && (
                                            <div className="text-center p-3 text-[0.95rem] text-muted bg-[#f5f5f5] rounded-md mt-auto">
                                                Subscription is paused
                                            </div>
                                        )}
                                        {subscription.meta?.canceled && (
                                            <div className="text-center p-3 text-[0.95rem] text-muted bg-[#f5f5f5] rounded-md mt-auto">
                                                Subscription has been cancelled
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center p-10">
                            <p className="text-lg text-muted mb-6">You don't have any active subscriptions.</p>
                            <a href="/subscriptions" className="inline-block px-8 py-3.5 bg-cta text-black no-underline rounded-lg text-base font-bold transition-all duration-200 shadow-sm hover:bg-cta-hover hover:shadow-md hover:-translate-y-px">
                                Explore Subscriptions
                            </a>
                        </div>
                    )}
                </section>

                {/* Order History Section */}
                <section className="bg-white p-[30px] rounded-xl border border-[#e0e0e0] shadow-sm max-md:p-5">
                    <h2 className="text-2xl font-semibold mb-6 text-primary">Order History</h2>

                    {ordersWithItems.length > 0 ? (
                        <div className="flex flex-col gap-5">
                            {ordersWithItems.map((order: any) => {
                                const orderDate = new Date(order.meta?.timestamps?.created_at || order.created_at);
                                const allItems = order.items || [];
                                const displayItems = allItems.filter((item: any) => item.type !== 'promotion_item');

                                return (
                                    <div key={order.id} className="bg-[#f9f9f9] border border-[#e0e0e0] rounded-lg p-6 transition-shadow duration-200 hover:shadow-md">
                                        <div className="flex justify-between items-start mb-4 max-md:flex-col max-md:gap-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-primary m-0">Order #{order.id.slice(-8).toUpperCase()}</h3>
                                                <p className="text-sm text-muted mt-1 m-0">
                                                    {orderDate.toLocaleDateString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="shrink-0">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-[20px] text-sm font-medium uppercase",
                                                    statusStyles[order.status || 'complete'] || statusStyles.unknown
                                                )}>
                                                    {order.status || 'Complete'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-4 p-4 bg-white rounded-md">
                                            <p className="text-sm text-muted m-0 mb-3 font-medium">
                                                {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
                                            </p>
                                            {displayItems.slice(0, 3).map((item: any) => (
                                                <div key={item.id} className="flex justify-between items-center py-2 border-b border-[#f0f0f0] last:border-b-0">
                                                    <span className="text-[#333] text-[0.95rem]">{item.name}</span>
                                                    <span className="text-muted text-sm font-medium">x{item.quantity}</span>
                                                </div>
                                            ))}
                                            {displayItems.length > 3 && (
                                                <p className="text-sm text-primary mt-2 m-0 italic">...and {displayItems.length - 3} more</p>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-[#e0e0e0] max-md:flex-col max-md:gap-3 max-md:items-start">
                                            <div className="flex items-center gap-2 font-medium">
                                                <span>Total:</span>
                                                <span className="text-xl font-semibold text-secondary">
                                                    {order.meta?.display_price?.with_tax?.formatted || '£0.00'}
                                                </span>
                                            </div>
                                            {order.shipping_address && (
                                                <div className="text-sm text-muted flex flex-col items-end gap-0.5 max-md:items-start">
                                                    <span className="font-medium">Shipped to:</span>
                                                    <span>{order.shipping_address.first_name} {order.shipping_address.last_name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center p-10">
                            <p className="text-lg text-muted mb-6">You haven't placed any orders yet.</p>
                            <Link href="/" className="inline-block px-8 py-3.5 bg-cta text-black no-underline rounded-lg text-base font-bold transition-all duration-200 shadow-sm hover:bg-cta-hover hover:shadow-md hover:-translate-y-px">
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
        <Footer />
        </>
    );
}

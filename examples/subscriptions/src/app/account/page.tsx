import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_KEY } from "@/app/constants";
import { getV2AccountMembers, getV2Accounts, listSubscriptions, getCustomerOrders } from "@epcc-sdk/sdks-shopper";
import { initializeShopperClient } from "@/lib/epcc-shopper-client";
import CancelSubscriptionButton from "./CancelSubscriptionButton";
import UpdatePaymentMethodButton from "./UpdatePaymentMethodButton";
import SignOutButton from "./SignOutButton";

import Footer from "../../components/footer/Footer";
import styles from "./page.module.css";
import Link from "next/link";

initializeShopperClient();

async function getAccountData(token: string) {
    try {
        // Get member data
        const memberResponse = await getV2AccountMembers({
            headers: {
                'EP-Account-Management-Authentication-Token': token
            }
        });

        if (memberResponse.error) {
            console.error('Failed to fetch member data:', memberResponse.error);
            return null;
        }

        // Get account data
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

export const dynamic = 'force-dynamic'; // Ensure this page is always fresh

// Helper function to determine subscription display status and style
function getSubscriptionDisplayInfo(subscription: any) {
    const meta = subscription.meta;
    const status = meta?.status;
    
    // Check state flags in meta
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
    
    // Fallback
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

    // Fetch customer orders
    const ordersResponse = await getCustomerOrders({
        // @ts-ignore SDK issue - need to update the open api spec to include query params listed
        query: {
            include: ['items'] as const,
            sort: '-created_at' as any,
            page: {
                limit: 10 // Show last 10 orders
            }
        }
    });

    const orders = ordersResponse.data?.data || [];
    // @ts-ignore SDK issue - need to update the open api spec to include included.items
    const includedItems = ordersResponse.data?.included?.items || [];
    
    // Map items to their respective orders
    const ordersWithItems = orders.map((order) => {
        // Get item references from the order relationships
        const itemRefs = order.relationships?.items?.data || [];
        
        // Map the item references to actual item objects from included.items
        const orderItems = itemRefs.map((ref) => {
            return includedItems.find((item: {id: string}) =>
                item.id === ref.id
            );
        }).filter(Boolean); // Remove any undefined items
        
        return {
            ...order,
            items: orderItems
        };
    });

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>My Account</h1>
                    <SignOutButton />
                </div>
            
            <div className={styles.sections}>
                {/* Account Details Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Account Details</h2>
                    <div className={styles.detailsCard}>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Name:</span>
                            <span className={styles.value}>{accountData.member?.name || 'Not set'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Email:</span>
                            <span className={styles.value}>{accountData.member?.email}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Account Type:</span>
                            <span className={styles.value}>{accountData.account?.type || 'Standard'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Member Since:</span>
                            <span className={styles.value}>
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
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>My Subscriptions</h2>
                    
                    {subscriptions.data?.data && subscriptions.data.data.length > 0 ? (
                        <div className={styles.subscriptionsGrid}>
                            {subscriptions.data.data
                                .sort((a: any, b: any) => {
                                    // Sort by created_at date, newest first
                                    const dateA = new Date(a.meta?.timestamps?.created_at || 0);
                                    const dateB = new Date(b.meta?.timestamps?.created_at || 0);
                                    return dateB.getTime() - dateA.getTime();
                                })
                                .map((subscription: any) => {
                                // Get the plan using the plan_id from subscription attributes
                                const planId = subscription.attributes?.plan_id;
                                const plan = subscriptions.data?.included?.plans?.find((p: any) => p.id === planId);
                                
                                // Get the pricing option using the pricing_option_id from subscription attributes
                                const pricingOptionId = subscription.attributes?.pricing_option_id;
                                const pricingOption = subscriptions.data?.included?.pricing_options?.find((p: any) => p.id === pricingOptionId);
                                
                                // Format the price
                                let formattedPrice = '£4.99/month';
                                if (pricingOption && plan) {
                                    // Check if the pricing option has prices for this plan
                                    const priceData = pricingOption.meta?.prices?.[planId];
                                    if (priceData?.display_price?.without_tax?.formatted) {
                                        formattedPrice = priceData.display_price.without_tax.formatted;
                                    } else if (priceData?.display_price?.with_tax?.formatted) {
                                        formattedPrice = priceData.display_price.with_tax.formatted;
                                    }
                                    
                                    // Add interval
                                    const interval = pricingOption.attributes?.billing_interval_type || 'month';
                                    const frequency = pricingOption.attributes?.billing_frequency || 1;
                                    const intervalText = frequency === 1 ? interval : `${frequency} ${interval}s`;
                                    formattedPrice = `${formattedPrice}/${intervalText}`;
                                }
                                
                                // Get subscription display info
                                const displayInfo = getSubscriptionDisplayInfo(subscription);
                                
                                return (
                                    <div key={subscription.id} className={styles.subscriptionCard}>
                                        <div className={styles.subscriptionHeader}>
                                            <h3 className={styles.subscriptionName}>
                                                {plan?.attributes?.name}
                                            </h3>
                                            <span className={`${styles.status} ${styles[displayInfo.className]}`}>
                                                {displayInfo.text}
                                            </span>
                                        </div>
                                        
                                        <div className={styles.subscriptionDetails}>
                                            <p className={styles.price}>{formattedPrice}</p>
                                            {/* Show next billing only for active subscriptions */}
                                            {subscription.meta?.status === 'active' && !subscription.meta?.canceled && !subscription.meta?.paused && subscription.meta?.invoice_after && (
                                                <p className={styles.nextBilling}>
                                                    Next billing: {new Date(subscription.meta.invoice_after).toLocaleDateString('en-GB')}
                                                </p>
                                            )}
                                            {/* Show go live date for pending subscriptions */}
                                            {subscription.meta?.pending && subscription.attributes?.go_live_after && (
                                                <p className={styles.nextBilling}>
                                                    Starts: {new Date(subscription.attributes.go_live_after).toLocaleDateString('en-GB')}
                                                </p>
                                            )}
                                        </div>

                                        {plan?.attributes?.description && (
                                            <div className={styles.description}>
                                                <p>{plan.attributes.description}</p>
                                            </div>
                                        )}

                                        {/* Show cancel button only for active subscriptions that aren't already canceled */}
                                        {subscription.meta?.status === 'active' && !subscription.meta?.canceled && !subscription.meta?.paused && (
                                            <div className={styles.subscriptionActions}>
                                                <UpdatePaymentMethodButton subscriptionId={subscription.id} />
                                                <CancelSubscriptionButton subscriptionId={subscription.id} />
                                            </div>
                                        )}
                                        
                                        {/* Show appropriate message for other states */}
                                        {subscription.meta?.paused && (
                                            <div className={styles.stateMessage}>
                                                Subscription is paused
                                            </div>
                                        )}
                                        {subscription.meta?.canceled && (
                                            <div className={styles.stateMessage}>
                                                Subscription has been cancelled
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.noSubscriptions}>
                            <p>You don't have any active subscriptions.</p>
                            <a href="/subscriptions" className={styles.exploreButton}>
                                Explore Subscriptions
                            </a>
                        </div>
                    )}
                </section>

                {/* Order History Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Order History</h2>
                    
                    {ordersWithItems.length > 0 ? (
                        <div className={styles.ordersContainer}>
                            {ordersWithItems.map((order: any) => {
                                const orderDate = new Date(order.meta?.timestamps?.created_at || order.created_at);
                                
                                // Use the mapped items and filter out promotion items for display
                                const allItems = order.items || [];
                                const displayItems = allItems.filter((item: any) => item.type !== 'promotion_item');
                                
                                return (
                                    <div key={order.id} className={styles.orderCard}>
                                        <div className={styles.orderHeader}>
                                            <div>
                                                <h3 className={styles.orderNumber}>Order #{order.id.slice(-8).toUpperCase()}</h3>
                                                <p className={styles.orderDate}>
                                                    {orderDate.toLocaleDateString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className={styles.orderStatus}>
                                                <span className={`${styles.status} ${styles[order.status || 'complete']}`}>
                                                    {order.status || 'Complete'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.orderItems}>
                                            <p className={styles.itemCount}>
                                                {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
                                            </p>
                                            {displayItems.slice(0, 3).map((item: any) => (
                                                <div key={item.id} className={styles.orderItem}>
                                                    <span className={styles.itemName}>{item.name}</span>
                                                    <span className={styles.itemQuantity}>x{item.quantity}</span>
                                                </div>
                                            ))}
                                            {displayItems.length > 3 && (
                                                <p className={styles.moreItems}>...and {displayItems.length - 3} more</p>
                                            )}
                                        </div>
                                        
                                        <div className={styles.orderFooter}>
                                            <div className={styles.orderTotal}>
                                                <span>Total:</span>
                                                <span className={styles.totalAmount}>
                                                    {order.meta?.display_price?.with_tax?.formatted || '£0.00'}
                                                </span>
                                            </div>
                                            {order.shipping_address && (
                                                <div className={styles.shippingInfo}>
                                                    <span className={styles.shippingLabel}>Shipped to:</span>
                                                    <span>{order.shipping_address.first_name} {order.shipping_address.last_name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.noOrders}>
                            <p>You haven't placed any orders yet.</p>
                            <Link href="/" className={styles.shopButton}>
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
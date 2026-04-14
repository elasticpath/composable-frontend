"use client";
import {loadStripe, StripeElementsOptions} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import CheckoutForm from "@/app/checkout/CheckoutForm";
import {type CartEntityResponse} from "@epcc-sdk/sdks-shopper";
import Link from "next/link";
import "./CheckoutElements.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
    stripeAccount: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID!,
});

interface CheckoutElementsProps {
    cart: CartEntityResponse;
    userData?: any;
    isAuthenticated: boolean;
}

export function CheckoutElements({cart, userData, isAuthenticated}: CheckoutElementsProps) {
    const amount = cart.data.meta?.display_price?.with_tax?.amount
    const currency = cart.data.meta?.display_price?.with_tax?.currency

    if (!amount) {
        console.error("Cart does not have a valid amount for payment");
        return <span>Cart amount is not available</span>;
    }

    if (!currency) {
        console.error("Cart does not have a valid currency for payment");
        return <span>Cart currency is not available</span>;
    }

    // If user is not authenticated, show account creation prompt
    if (!isAuthenticated) {
        return (
            <div className="checkout-auth-required">
                <div className="auth-message-box">
                    <h2>Create an Account to Continue</h2>
                    <p>To complete your purchase, you'll need to create an account or sign in.</p>
                    <p className="benefits-text">Creating an account allows you to:</p>
                    <ul className="benefits-list">
                        <li>Track your orders</li>
                        <li>Save your delivery addresses</li>
                        <li>View your order history</li>
                        <li>Checkout faster next time</li>
                    </ul>
                    <div className="auth-actions">
                        <Link href="/register" className="btn btn-primary">
                            Create Account
                        </Link>
                        <Link href={`/login?redirectUrl=/checkout`} className="btn btn-secondary">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const options: StripeElementsOptions = {
        mode: 'payment',
        amount,
        currency: currency.toLowerCase(),
        setup_future_usage: "off_session",
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#005A86',
                colorBackground: '#fafafa',
                colorText: '#424242',
                colorDanger: '#d32f2f',
                borderRadius: '8px',
                fontFamily: 'Roboto, Arial, Helvetica, sans-serif'
            }
        }
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <CheckoutForm userData={userData} isAuthenticated={isAuthenticated} cart={cart} />
        </Elements>
    );
};
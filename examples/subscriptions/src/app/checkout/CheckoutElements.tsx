"use client";
import {loadStripe, StripeElementsOptions} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import CheckoutForm from "@/app/checkout/CheckoutForm";
import {type CartEntityResponse} from "@epcc-sdk/sdks-shopper";
import Link from "next/link";

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
            <div className="min-h-[60vh] flex items-center justify-center px-5 py-10">
                <div className="bg-white rounded-xl p-12 max-w-[600px] w-full text-center shadow-sm border border-[#e5e5e5] max-[600px]:px-6 max-[600px]:py-8">
                    <h2 className="text-[#212121] text-[2rem] font-medium mb-4 max-[600px]:text-2xl">
                        Create an Account to Continue
                    </h2>
                    <p className="text-[#616161] text-base mb-6 leading-relaxed">
                        To complete your purchase, you'll need to create an account or sign in.
                    </p>
                    <p className="text-[#424242] font-medium mb-4">
                        Creating an account allows you to:
                    </p>
                    <ul className="list-none p-0 mb-8 text-left max-w-[300px] mx-auto">
                        <li className="relative pl-7 mb-3 text-[#616161] text-[15px] before:content-['✓'] before:absolute before:left-0 before:text-accent before:font-bold before:text-lg">
                            Track your orders
                        </li>
                        <li className="relative pl-7 mb-3 text-[#616161] text-[15px] before:content-['✓'] before:absolute before:left-0 before:text-accent before:font-bold before:text-lg">
                            Save your delivery addresses
                        </li>
                        <li className="relative pl-7 mb-3 text-[#616161] text-[15px] before:content-['✓'] before:absolute before:left-0 before:text-accent before:font-bold before:text-lg">
                            View your order history
                        </li>
                        <li className="relative pl-7 mb-3 text-[#616161] text-[15px] before:content-['✓'] before:absolute before:left-0 before:text-accent before:font-bold before:text-lg">
                            Checkout faster next time
                        </li>
                    </ul>
                    <div className="flex gap-4 justify-center flex-wrap max-[600px]:flex-col max-[600px]:w-full">
                        <Link
                            href="/register"
                            className="inline-block text-center min-w-[160px] px-8 py-3.5 border-none rounded-lg text-base font-bold no-underline transition-all duration-200 bg-cta text-black shadow-sm hover:bg-cta-hover hover:shadow-md hover:-translate-y-px max-[600px]:w-full"
                        >
                            Create Account
                        </Link>
                        <Link
                            href={`/login?redirectUrl=/checkout`}
                            className="inline-block text-center min-w-[160px] px-8 py-3.5 rounded-lg text-base font-medium no-underline transition-all duration-200 bg-white text-black border-2 border-cta shadow-sm hover:bg-[#e6faf0] hover:border-cta-hover hover:-translate-y-px max-[600px]:w-full"
                        >
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

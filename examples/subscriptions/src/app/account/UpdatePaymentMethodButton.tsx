'use client';

import {useState} from 'react';
import {loadStripe, StripeElementsOptions} from '@stripe/stripe-js';
import {Elements, PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js';
import {updateSubscriptionPaymentAuthority} from './actions';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
    stripeAccount: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID!,
});

function UpdatePaymentMethodForm({subscriptionId, onCancel, onSuccess}: {
    subscriptionId: string;
    onCancel: () => void;
    onSuccess: () => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(undefined);

        const {error: submitError} = await elements.submit();
        if (submitError) {
            setError(submitError.message);
            setLoading(false);
            return;
        }

        const {error: confirmError, setupIntent} = await stripe.confirmSetup({
            elements,
            redirect: 'if_required',
            confirmParams: {
                return_url: window.location.href,
            },
        });

        if (confirmError) {
            setError(confirmError.message);
            setLoading(false);
            return;
        }

        const paymentMethodId = typeof setupIntent?.payment_method === 'string'
            ? setupIntent.payment_method
            : setupIntent?.payment_method?.id;

        if (!paymentMethodId) {
            setError('Failed to retrieve payment method from Stripe');
            setLoading(false);
            return;
        }

        try {
            await updateSubscriptionPaymentAuthority(subscriptionId, paymentMethodId);
            onSuccess();
        } catch {
            setError('Failed to update payment method. Please try again.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-white border border-[#e0e0e0] rounded-lg">
            <PaymentElement />
            {error && <div className="text-[#dc3545] text-sm mt-2 text-center">{error}</div>}
            <div className="flex gap-3 w-full">
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="flex-1 px-6 py-3 bg-cta text-black border-none rounded-lg text-base font-bold cursor-pointer transition-all duration-200 hover:not-disabled:bg-cta-hover disabled:bg-[#e0e0e0] disabled:text-[#9e9e9e] disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : 'Save New Card'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-[#dc3545] text-white border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 hover:not-disabled:bg-[#c82333] hover:not-disabled:shadow-md hover:not-disabled:-translate-y-px disabled:bg-[#e0e0e0] disabled:text-[#9e9e9e] disabled:cursor-not-allowed disabled:translate-y-0"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

interface UpdatePaymentMethodButtonProps {
    subscriptionId: string;
}

export default function UpdatePaymentMethodButton({subscriptionId}: UpdatePaymentMethodButtonProps) {
    const [open, setOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loadingIntent, setLoadingIntent] = useState(false);
    const [fetchError, setFetchError] = useState<string | undefined>();
    const [success, setSuccess] = useState(false);

    const handleOpen = async () => {
        setLoadingIntent(true);
        setFetchError(undefined);
        try {
            const res = await fetch('/api/setup-intent', {method: 'POST'});
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Failed to initialise payment form');
            setClientSecret(data.clientSecret);
            setOpen(true);
        } catch (err: any) {
            setFetchError(err.message);
        } finally {
            setLoadingIntent(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setClientSecret(null);
    };

    const handleSuccess = () => {
        setOpen(false);
        setClientSecret(null);
        setSuccess(true);
    };

    if (success) {
        return (
            <div className="text-center p-3 text-[0.95rem] text-muted bg-[#f5f5f5] rounded-md mt-auto">
                Payment method updated successfully.
            </div>
        );
    }

    const options: StripeElementsOptions = {
        clientSecret: clientSecret ?? undefined,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#005A86',
                colorBackground: '#fafafa',
                colorText: '#424242',
                colorDanger: '#d32f2f',
                borderRadius: '8px',
                fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
            },
        },
    };

    return (
        <div>
            {!open && (
                <button
                    onClick={handleOpen}
                    disabled={loadingIntent}
                    className="w-full px-6 py-3 bg-cta text-black border-none rounded-lg text-base font-bold cursor-pointer transition-all duration-200 shadow-sm hover:not-disabled:bg-cta-hover hover:not-disabled:shadow-md hover:not-disabled:-translate-y-px disabled:bg-[#e0e0e0] disabled:text-[#9e9e9e] disabled:cursor-not-allowed disabled:translate-y-0"
                >
                    {loadingIntent ? 'Loading...' : 'Update Payment Method'}
                </button>
            )}
            {fetchError && <div className="text-[#dc3545] text-sm mt-2 text-center">{fetchError}</div>}
            {open && clientSecret && (
                <Elements stripe={stripePromise} options={options}>
                    <UpdatePaymentMethodForm
                        subscriptionId={subscriptionId}
                        onCancel={handleClose}
                        onSuccess={handleSuccess}
                    />
                </Elements>
            )}
        </div>
    );
}

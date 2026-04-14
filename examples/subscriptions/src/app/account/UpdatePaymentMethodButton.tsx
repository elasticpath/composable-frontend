'use client';

import {useState} from 'react';
import {loadStripe, StripeElementsOptions} from '@stripe/stripe-js';
import {Elements, PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js';
import {updateSubscriptionPaymentAuthority} from './actions';
import styles from './page.module.css';

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
        <form onSubmit={handleSubmit} className={styles.updatePaymentForm}>
            <PaymentElement />
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.updatePaymentActions}>
                <button type="submit" disabled={!stripe || loading} className={styles.saveCardButton}>
                    {loading ? 'Saving...' : 'Save New Card'}
                </button>
                <button type="button" onClick={onCancel} disabled={loading} className={styles.cancelButton}>
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
        return <div className={styles.stateMessage}>Payment method updated successfully.</div>;
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
                <button onClick={handleOpen} disabled={loadingIntent} className={styles.updatePaymentButton}>
                    {loadingIntent ? 'Loading...' : 'Update Payment Method'}
                </button>
            )}
            {fetchError && <div className={styles.errorMessage}>{fetchError}</div>}
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

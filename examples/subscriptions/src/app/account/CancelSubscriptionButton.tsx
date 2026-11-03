'use client';

import { useFormStatus } from 'react-dom';
import { cancelSubscription } from './actions';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            className="w-full px-6 py-3 bg-[#dc3545] text-white border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 shadow-sm hover:not-disabled:bg-[#c82333] hover:not-disabled:shadow-md hover:not-disabled:-translate-y-px disabled:bg-[#e0e0e0] disabled:text-[#9e9e9e] disabled:cursor-not-allowed disabled:translate-y-0"
            disabled={pending}
            onClick={(e) => {
                if (!confirm('Are you sure you want to cancel your subscription?')) {
                    e.preventDefault();
                }
            }}
        >
            {pending ? 'Cancelling...' : 'Cancel Subscription'}
        </button>
    );
}

interface CancelSubscriptionButtonProps {
    subscriptionId: string;
}

export default function CancelSubscriptionButton({ subscriptionId }: CancelSubscriptionButtonProps) {
    const cancelSubscriptionWithId = cancelSubscription.bind(null, subscriptionId);

    return (
        <form action={cancelSubscriptionWithId}>
            <SubmitButton />
        </form>
    );
}

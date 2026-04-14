'use client';

import { useFormStatus } from 'react-dom';
import { cancelSubscription } from './actions';
import styles from './page.module.css';

function SubmitButton() {
    const { pending } = useFormStatus();
    
    return (
        <button 
            type="submit"
            className={styles.cancelButton}
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
    // Bind the subscription ID to the server action
    const cancelSubscriptionWithId = cancelSubscription.bind(null, subscriptionId);
    
    return (
        <form action={cancelSubscriptionWithId}>
            <SubmitButton />
        </form>
    );
}
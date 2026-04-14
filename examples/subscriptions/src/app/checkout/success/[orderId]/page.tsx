import Link from 'next/link';
import styles from './page.module.css';

export default async function CheckoutSuccessPage({
    params
}: {
    params: Promise<{ orderId: string }>
}) {
    const { orderId } = await params;
    
    return (
        <div className={styles.container}>
            <div className={styles.successCard}>
                <div className={styles.successIcon}>✓</div>
                <h1 className={styles.title}>
                    Order Successful!
                </h1>
                <p className={styles.orderId}>
                    Order ID: {orderId}
                </p>
                <p className={styles.message}>
                    Thank you for your purchase.
                </p>
                <Link href="/account" className={styles.button}>
                    Manage Subscriptions
                </Link>
            </div>
        </div>
    );
}
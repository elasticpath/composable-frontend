import Link from 'next/link';
import styles from './PlusBanner.module.css';

export default function PlusBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.plusBadge}>Thortful Plus</span>
          <span className={styles.text}>
            Get <strong>FREE delivery</strong> on all orders, <strong>10% off</strong> everything & more!
          </span>
          <Link href="/plus" className={styles.joinButton}>
            Join Now
          </Link>
        </div>
      </div>
    </div>
  );
}
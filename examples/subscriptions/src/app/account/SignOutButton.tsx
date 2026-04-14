'use client';

import { signOut } from './signout-action';
import styles from './page.module.css';

export default function SignOutButton() {
    return (
        <form action={signOut}>
            <button 
                type="submit"
                className={styles.signOutButton}
            >
                Sign Out
            </button>
        </form>
    );
}
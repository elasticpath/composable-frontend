'use client';

import { signOut } from './signout-action';

export default function SignOutButton() {
    return (
        <form action={signOut}>
            <button
                type="submit"
                className="px-6 py-2.5 bg-white text-black border border-cta rounded-lg text-base font-bold cursor-pointer transition-all duration-200 shadow-sm hover:bg-cta hover:text-black hover:shadow-md"
            >
                Sign Out
            </button>
        </form>
    );
}

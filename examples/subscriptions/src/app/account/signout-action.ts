'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCOUNT_MEMBER_TOKEN_COOKIE_KEY } from '@/app/constants';

export async function signOut() {
    const cookieStore = await cookies();
    
    // Delete the authentication cookie
    cookieStore.delete(ACCOUNT_MEMBER_TOKEN_COOKIE_KEY);
    
    // Redirect to login page
    redirect('/');
}
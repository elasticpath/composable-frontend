'use client';

import { useActionState } from 'react';
import { registerUser } from './actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const initialState = {
    message: '',
};

function RegisterFormContent() {
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirectUrl');

    const registerUserWithRedirect = registerUser.bind(null, redirectUrl);
    const [state, formAction, pending] = useActionState(registerUserWithRedirect, initialState);

    return (
        <div className="min-h-[calc(100vh-300px)] flex items-center justify-center bg-[#fafafa] px-5 py-10">
            <div className="bg-white p-10 rounded-xl shadow-sm w-full max-w-[400px] border border-[#e5e5e5] max-[480px]:px-5 max-[480px]:py-[30px]">
                <h1 className="text-center mb-[30px] text-primary text-[1.875rem] font-semibold max-[480px]:text-2xl">
                    Create Account
                </h1>

                {state?.message && (
                    <div className="px-4 py-3 rounded-lg mb-5 text-center bg-red-50 text-red-800 border border-red-400 text-sm">
                        {state.message}
                    </div>
                )}

                <form action={formAction} className="flex flex-col gap-5">
                    <div className="flex flex-col">
                        <label htmlFor="name" className="mb-2 text-[#424242] font-normal text-sm">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Your full name"
                            autoComplete="name"
                            required
                            className="px-4 py-3 border border-[#e0e0e0] rounded-lg text-base transition-all duration-200 bg-[#fafafa] hover:border-[#bdbdbd] focus:outline-none focus:border-primary focus:bg-white focus:ring-3 focus:ring-[rgba(0,51,102,0.1)]"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="email" className="mb-2 text-[#424242] font-normal text-sm">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="your@email.com"
                            autoComplete="email"
                            required
                            className="px-4 py-3 border border-[#e0e0e0] rounded-lg text-base transition-all duration-200 bg-[#fafafa] hover:border-[#bdbdbd] focus:outline-none focus:border-primary focus:bg-white focus:ring-3 focus:ring-[rgba(0,51,102,0.1)]"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="password" className="mb-2 text-[#424242] font-normal text-sm">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Create a password"
                            autoComplete="new-password"
                            required
                            className="px-4 py-3 border border-[#e0e0e0] rounded-lg text-base transition-all duration-200 bg-[#fafafa] hover:border-[#bdbdbd] focus:outline-none focus:border-primary focus:bg-white focus:ring-3 focus:ring-[rgba(0,51,102,0.1)]"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full px-6 py-3.5 border-none rounded-lg text-base font-bold cursor-pointer transition-all duration-200 bg-cta text-black shadow-sm hover:not-disabled:bg-cta-hover hover:not-disabled:shadow-md hover:not-disabled:-translate-y-px active:not-disabled:translate-y-0 active:not-disabled:shadow-sm disabled:bg-[#e0e0e0] disabled:text-[#9e9e9e] disabled:cursor-not-allowed disabled:shadow-none"
                        disabled={pending}
                    >
                        {pending ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="text-center mt-[30px] pt-5 border-t border-[#f0f0f0]">
                    <p className="text-[#616161] text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-secondary no-underline font-medium transition-colors duration-200 hover:text-[#00C865] hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function RegisterForm() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterFormContent />
        </Suspense>
    );
}

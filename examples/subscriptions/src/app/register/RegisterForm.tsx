'use client';

import { useActionState } from 'react';
import { registerUser } from './actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import './register.css';

const initialState = {
    message: '',
};

function RegisterFormContent() {
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirectUrl');
    
    const registerUserWithRedirect = registerUser.bind(null, redirectUrl);
    const [state, formAction, pending] = useActionState(registerUserWithRedirect, initialState);

    return (
        <div className="register-container">
            <div className="register-box">
                <h1 className="register-title">Create Account</h1>
                
                {state?.message && (
                    <div className="alert alert-error">{state.message}</div>
                )}
                
                <form action={formAction} className="register-form">
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Your full name"
                            autoComplete="name"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="your@email.com"
                            autoComplete="email"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Create a password"
                            autoComplete="new-password"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={pending}
                    >
                        {pending ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
                
                <div className="register-footer">
                    <p>
                        Already have an account?{' '}
                        <Link href="/login" className="login-link">
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
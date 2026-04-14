'use client';

import { useActionState } from 'react';
import { loginUser } from './actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import './login.css';

const initialState = {
    message: '',
};

function LoginFormContent() {
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirectUrl');
    
    const loginUserWithRedirect = loginUser.bind(null, redirectUrl);
    const [state, formAction, pending] = useActionState(loginUserWithRedirect, initialState);

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">Sign In</h1>
                
                {state?.message && (
                    <div className="alert alert-error">{state.message}</div>
                )}
                
                <form action={formAction} className="login-form">
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
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    
                    <div className="form-actions">
                        <Link href="/forgot-password" className="forgot-password-link">
                            Forgot your password?
                        </Link>
                    </div>
                    
                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={pending}
                    >
                        {pending ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="login-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link href="/register" className="register-link">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginForm() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginFormContent />
        </Suspense>
    );
}
"use client";
import React, {useState, useEffect} from 'react';
import {useStripe, useElements, PaymentElement, AddressElement} from '@stripe/react-stripe-js';
import {useFormState} from "react-dom";
import {type CartEntityResponse} from "@epcc-sdk/sdks-shopper";
import {useRouter} from "next/navigation";

const initialState = {
    message: '',
}

interface CheckoutFormProps {
    userData?: any;
    isAuthenticated: boolean;
    cart: CartEntityResponse;
}

export default function CheckoutForm({ userData, isAuthenticated, cart }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter()

    const [errorMessage, setErrorMessage] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer: {
            email: userData?.email || '',
            name: userData?.name || ''
        },
        billingAddress: {
            first_name: userData?.name?.split(' ')[0] || '',
            last_name: userData?.name?.split(' ').slice(1).join(' ') || '',
            line_1: '',
            line_2: '',
            city: '',
            region: '',
            postcode: '',
            country: ''
        }
    });
    const [formErrors, setFormErrors] = useState<any>({});

    const handleError = (error: any) => {
        setLoading(false);
        setErrorMessage(error.message);
    }

    const handleInputChange = (field: string, value: string) => {
        const [section, key] = field.split('.');
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                [key]: value
            }
        }));

        if (formErrors[field]) {
            setFormErrors((prev: any) => {
                const newErrors = {...prev};
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Check if cart has subscription items
    const hasSubscriptionItems = cart.data.relationships?.items?.data?.some((item: any) => {
        // You may need to check the actual cart items for subscription type
        return false; // Placeholder - implement based on your cart structure
    });

    const validateForm = () => {
        const errors: any = {};

        // Only require email and name if not authenticated and has subscription items
        if (!isAuthenticated && hasSubscriptionItems) {
            if (!formData.customer.email) {
                errors['customer.email'] = 'Email is required for subscription items';
            } else if (!/\S+@\S+\.\S+/.test(formData.customer.email)) {
                errors['customer.email'] = 'Email is invalid';
            }

            if (!formData.customer.name) {
                errors['customer.name'] = 'Name is required for subscription items';
            }
        }

        // Address validation is now handled by Stripe AddressElement

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!stripe) {
            return;
        }

        if (!elements) {
            return;
        }

        setLoading(true);

        const {error: submitError} = await elements.submit();
        if (submitError) {
            handleError(submitError);
            return;
        }

        const {error, confirmationToken} = await stripe.createConfirmationToken({
            elements,
        });

        if (error) {
            handleError(error);
            return;
        }

        // Extract billing address from Stripe Elements
        const addressElement = elements.getElement('address');
        if (addressElement) {
            const {complete, value} = await addressElement.getValue();
            if (complete && value) {
                formData.billingAddress = {
                    first_name: value.firstName || formData.billingAddress.first_name,
                    last_name: value.lastName || formData.billingAddress.last_name,
                    line_1: value.address.line1 || '',
                    line_2: value.address.line2 || '',
                    city: value.address.city || '',
                    region: value.address.state || '',
                    postcode: value.address.postal_code || '',
                    country: value.address.country || ''
                };
            }
        }

        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                confirmationTokenId: confirmationToken.id,
                customer: formData.customer,
                billingAddress: formData.billingAddress
            }),
        });

        if (res.ok) {
            const { successUrl } = await res.json();
            router.push(successUrl);
        } else {
            const { error } = await res.json();
            setErrorMessage(error);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-[800px] mx-auto p-5 max-md:p-4">
            <div className="flex flex-col gap-6">
                {isAuthenticated && (
                    <div className="bg-[#fff3e0] border border-accent rounded-lg px-4 py-3 mb-5">
                        <p className="m-0 text-sm text-[#e65100]">Logged in as: <strong>{userData?.email}</strong></p>
                    </div>
                )}

                <section className="bg-white p-6 rounded-xl border border-[#e0e0e0] shadow-sm max-md:p-5">
                    <h2 className="m-0 mb-5 text-[#212121] text-[1.375rem] font-medium">
                        Billing Address
                    </h2>
                    <AddressElement
                        options={{
                            mode: 'billing',
                            display: {
                                name: 'split'
                            },
                            defaultValues: {
                                firstName: formData.billingAddress.first_name,
                                lastName: formData.billingAddress.last_name,
                                address: {
                                    line1: formData.billingAddress.line_1,
                                    line2: formData.billingAddress.line_2,
                                    city: formData.billingAddress.city,
                                    state: formData.billingAddress.region,
                                    postal_code: formData.billingAddress.postcode,
                                    country: formData.billingAddress.country || 'US'
                                }
                            }
                        }}
                    />
                </section>

                <section className="bg-white p-6 rounded-xl border border-[#e0e0e0] shadow-sm max-md:p-5">
                    <h2 className="m-0 mb-5 text-[#212121] text-[1.375rem] font-medium">
                        Payment Information
                    </h2>
                    <PaymentElement />
                </section>
            </div>

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full mt-6 px-8 py-3.5 border-none rounded-lg text-base font-bold cursor-pointer transition-all duration-200 bg-cta text-black shadow-sm hover:not-disabled:bg-cta-hover hover:not-disabled:shadow-md hover:not-disabled:-translate-y-px active:not-disabled:translate-y-0 active:not-disabled:shadow-sm disabled:bg-[#e0e0e0] disabled:text-[#9e9e9e] disabled:cursor-not-allowed disabled:shadow-none"
            >
                {loading ? 'Processing...' : 'Complete Order'}
            </button>

            {errorMessage && (
                <div className="text-danger text-sm mt-2 text-center">{errorMessage}</div>
            )}
        </form>
    );
}

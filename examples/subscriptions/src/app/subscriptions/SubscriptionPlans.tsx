'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addMembershipToCart } from './actions';
import { getPlans, getPricingOptionsForPlan, formatPriceForPricingOption, formatPricingOptionInterval } from '@/lib/offering-helpers';
import type { GetOfferingResponse } from '@epcc-sdk/sdks-shopper';
import { cn } from '@/lib/cn';

interface MembershipPlansProps {
    offerings: GetOfferingResponse | null;
}

export default function MembershipPlans({ offerings }: MembershipPlansProps) {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [selectedPricingOption, setSelectedPricingOption] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const plans = getPlans(offerings);

    const handleAddToCart = async () => {
        if (!offerings?.data?.id || !selectedPlan || !selectedPricingOption) {
            setError('Please select a membership plan and pricing option');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await addMembershipToCart(
                offerings.data.id,
                selectedPlan,
                selectedPricingOption
            );

            if (result.success) {
                router.push('/cart');
            } else {
                setError(result.error || 'Failed to add membership to cart');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const getSelectedPlan = () => plans.find(p => p.id === selectedPlan);
    const getPricingOptions = () => {
        const plan = getSelectedPlan();
        return plan ? getPricingOptionsForPlan(offerings, plan) : [];
    };


    if (!offerings || plans.length === 0) {
        return (
            <div className="min-h-screen bg-[#f9fafb]">
                <div className="text-center py-16">
                    <h1 className="text-primary mb-4">Subscription Plans</h1>
                    <p className="text-primary text-lg">No subscription plans are currently available. Please check back later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9fafb]">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8 text-center">
                    {error}
                </div>
            )}

            <div className="mb-12 bg-white px-8 py-8 rounded-xl">
                <h2 className="text-primary mb-12 text-[2rem] text-center font-bold">Choose a Subscription Plan</h2>
                <div className="grid grid-cols-3 gap-8 max-w-[1200px] mx-auto max-lg:grid-cols-1">
                    {plans.map((plan, index) => {
                        const isRecommended = index === 1;
                        const pricingOptions = getPricingOptionsForPlan(offerings, plan);
                        const defaultPrice = pricingOptions[0];

                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    "border-2 border-[#e5e7eb] rounded-lg p-4 bg-white cursor-pointer transition-all duration-300 relative flex flex-col",
                                    "hover:border-primary hover:shadow-[0_4px_12px_rgba(0,51,102,0.1)]",
                                    selectedPlan === plan.id && "border-primary shadow-[0_4px_12px_rgba(0,51,102,0.3)] bg-[#f0f4f8]",
                                    isRecommended && "border-secondary shadow-[0_8px_16px_rgba(0,51,102,0.1)]"
                                )}
                                onClick={() => {
                                    setSelectedPlan(plan.id || null);
                                    setSelectedPricingOption(null);
                                    setTimeout(() => {
                                        const el = document.getElementById('pricing-section');
                                        if (el) {
                                            const y = el.getBoundingClientRect().top + window.scrollY - 70;
                                            window.scrollTo({ top: y, behavior: 'smooth' });
                                        }
                                    }, 100);
                                }}
                            >
                                {isRecommended && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-secondary text-white px-4 py-1 rounded-full text-sm font-semibold">
                                            RECOMMENDED
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-primary text-lg mb-0.5 font-bold">{plan.attributes?.name || 'Membership Plan'}</h3>
                                <div className="mb-2.5">
                                    <span className="text-[1.75rem] font-bold text-primary">
                                        {defaultPrice ? formatPriceForPricingOption(plan, defaultPrice) : '$0'}
                                    </span>
                                    <span className="text-primary ml-2 text-base">
                                        {defaultPrice ? `per ${formatPricingOptionInterval(defaultPrice)}` : 'per year'}
                                    </span>
                                </div>
                                <ul className="list-none p-0 mb-3 grow">
                                    {plan.attributes?.feature_configurations ? (
                                        Object.keys(plan.attributes.feature_configurations).map((featureId) => {
                                            const feature = offerings?.included?.features?.find(f => f.id === featureId);
                                            return feature ? (
                                                <li key={feature.id} className="flex items-start py-1 text-primary">
                                                    <svg className="w-5 h-5 text-secondary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{feature.attributes?.name || feature.attributes?.description || 'Feature'}</span>
                                                </li>
                                            ) : null;
                                        })
                                    ) : (
                                        <li className="flex items-start py-1 text-primary">
                                            <svg className="w-5 h-5 text-secondary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span>Access to Elastic Path resources</span>
                                        </li>
                                    )}
                                </ul>
                                <button className={cn(
                                    "w-full py-3 bg-cta text-primary border-none rounded-lg text-base font-bold cursor-pointer transition-all duration-300 hover:bg-cta-hover",
                                    selectedPlan === plan.id && "bg-cta-hover hover:bg-[#1f9d60]"
                                )}>
                                    {selectedPlan === plan.id ? 'Selected' : 'Select This Plan'}
                                </button>
                            </div>
                        );
                    })}

                    {/* Enterprise Plan - Static */}
                    <div className="border-2 border-[#e5e7eb] rounded-lg p-4 bg-white cursor-default flex flex-col">
                        <h3 className="text-primary text-lg mb-0.5 font-bold">Enterprise</h3>
                        <div className="mb-2.5">
                            <span className="text-[1.75rem] font-bold text-primary">Custom</span>
                            <span className="text-primary ml-2 text-base">contact us</span>
                        </div>
                        <ul className="list-none p-0 mb-3 grow">
                            <li className="mt-4 mb-2 text-primary text-[0.9rem]">
                                <strong className="font-semibold">All Tiers Include:</strong>
                            </li>
                            <li className="flex items-start py-1 text-primary">
                                <svg className="w-5 h-5 text-secondary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Team Needs Assessment & Learning Plan Creation</span>
                            </li>
                            <li className="mt-4 mb-2 text-primary text-[0.9rem]">
                                <strong className="font-semibold">Silver+ Tiers:</strong>
                            </li>
                            <li className="flex items-start py-1 text-primary">
                                <svg className="w-5 h-5 text-secondary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Quarterly Invitation-Only Webinars</span>
                            </li>
                            <li className="flex items-start py-1 text-primary">
                                <svg className="w-5 h-5 text-secondary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>10% Off Member Rate</span>
                            </li>
                            <li className="mt-4 mb-2 text-primary text-[0.9rem]">
                                <strong className="font-semibold">Gold+ Tiers:</strong>
                            </li>
                            <li className="flex items-start py-1 text-primary">
                                <svg className="w-5 h-5 text-secondary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>TD Capability Model & Skills Gap Assessment</span>
                            </li>
                            <li className="mt-4 mb-2 text-primary text-[0.9rem]">
                                <strong className="font-semibold">Platinum Tier:</strong>
                            </li>
                            <li className="flex items-start py-1 text-primary">
                                <svg className="w-5 h-5 text-secondary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Early Bird Conference Pricing</span>
                            </li>
                            <li className="flex items-start py-1 text-primary">
                                <svg className="w-5 h-5 text-secondary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Research Center Access</span>
                            </li>
                            <li className="flex items-start py-1 text-primary">
                                <svg className="w-5 h-5 text-secondary mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>$10,000-$20,000 in Tailored Add-Ons</span>
                            </li>
                        </ul>
                        <a href="/contact-sales" className="block w-full py-3 bg-cta text-primary text-center border-none rounded-lg text-base font-bold no-underline transition-all duration-300 hover:bg-cta-hover">
                            Contact Sales
                        </a>
                    </div>
                </div>
            </div>

            {selectedPlan && (
                <div id="pricing-section" className="mb-12 bg-white px-8 py-12 rounded-xl">
                    <h2 className="text-primary mb-12 text-[2rem] text-center font-bold">Choose a Pricing Option</h2>
                    <div className="flex flex-col gap-4 max-w-[880px] mx-auto">
                        {getPricingOptions().map((option) => (
                            <div
                                key={option.id}
                                className={cn(
                                    "border-2 border-[#e5e7eb] rounded-lg p-6 cursor-pointer transition-all duration-300 bg-white relative flex items-center gap-4",
                                    "hover:border-primary hover:shadow-[0_4px_8px_rgba(0,51,102,0.1)]",
                                    selectedPricingOption === option.id && "border-secondary bg-[#f0faf5] shadow-[0_4px_8px_rgba(0,168,89,0.15)]"
                                )}
                                onClick={() => {
                                    setSelectedPricingOption(option.id || null);
                                    setTimeout(() => {
                                        document.getElementById('action-section')?.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                }}
                            >
                                <input
                                    type="radio"
                                    checked={selectedPricingOption === option.id}
                                    onChange={() => setSelectedPricingOption(option.id || null)}
                                    className="w-5 h-5 cursor-pointer shrink-0"
                                />
                                <div className="flex-1 flex justify-between items-center">
                                    <div className="flex-1">
                                        {option.attributes?.name && (
                                            <h4 className="text-primary text-lg m-0 mb-1 font-semibold">{option.attributes.name}</h4>
                                        )}
                                        {option.attributes?.description && (
                                            <p className="text-primary text-[0.9rem] m-0 leading-snug">{option.attributes.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[1.75rem] font-bold text-primary leading-none">
                                            {formatPriceForPricingOption(getSelectedPlan()!, option)}
                                        </span>
                                        <span className="text-primary text-[0.95rem]">
                                            / {formatPricingOptionInterval(option)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedPlan && selectedPricingOption && (
                <div id="action-section" className="text-center pb-12 mb-16">
                    <button
                        className="px-12 py-4 text-xl font-bold bg-cta text-primary border-none rounded-lg cursor-pointer transition-colors duration-300 hover:not-disabled:bg-cta-hover disabled:bg-[#ccc] disabled:cursor-not-allowed"
                        disabled={isLoading}
                        onClick={handleAddToCart}
                    >
                        {isLoading ? 'Adding to Cart...' : 'Add to Cart'}
                    </button>
                </div>
            )}
        </div>
    );
}

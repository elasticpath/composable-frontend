'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addMembershipToCart } from './actions';
import { getPlans, getPricingOptionsForPlan, formatPriceForPricingOption, formatPricingOptionInterval } from '@/lib/offering-helpers';
import type { GetOfferingResponse } from '@epcc-sdk/sdks-shopper';
import './subscription-plans.css';

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
            <div className="membership-plans-container">
                <div className="no-plans">
                    <h1>Subscription Plans</h1>
                    <p>No subscription plans are currently available. Please check back later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="membership-plans-container">
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="plans-section">
                <h2>Choose a Subscription Plan</h2>
                <div className="plans-grid">
                    {plans.map((plan, index) => {
                        const isRecommended = index === 1; // Make the middle plan recommended
                        const pricingOptions = getPricingOptionsForPlan(offerings, plan);
                        const defaultPrice = pricingOptions[0];
                        
                        return (
                            <div 
                                key={plan.id} 
                                className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}`}
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
                                    <div className="recommended-badge">
                                        <span>RECOMMENDED</span>
                                    </div>
                                )}
                                <h3>{plan.attributes?.name || 'Membership Plan'}</h3>
                                <div className="plan-pricing">
                                    <span className="plan-price">
                                        {defaultPrice ? formatPriceForPricingOption(plan, defaultPrice) : '$0'}
                                    </span>
                                    <span className="plan-period">
                                        {defaultPrice ? `per ${formatPricingOptionInterval(defaultPrice)}` : 'per year'}
                                    </span>
                                </div>
                                <ul className="plan-features">
                                    {plan.attributes?.feature_configurations ? (
                                        Object.keys(plan.attributes.feature_configurations).map((featureId) => {
                                            const feature = offerings?.included?.features?.find(f => f.id === featureId);
                                            return feature ? (
                                                <li key={feature.id}>
                                                    <svg className="feature-check" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{feature.attributes?.name || feature.attributes?.description || 'Feature'}</span>
                                                </li>
                                            ) : null;
                                        })
                                    ) : (
                                        <li>
                                            <svg className="feature-check" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span>Access to Elastic Path resources</span>
                                        </li>
                                    )}
                                </ul>
                                <button className={`select-plan-btn ${isRecommended ? 'recommended-btn' : ''}`}>
                                    {selectedPlan === plan.id ? 'Selected' : 'Select This Plan'}
                                </button>
                            </div>
                        );
                    })}
                    
                    {/* Enterprise Plan - Static */}
                    <div className="plan-card enterprise-plan">
                        <h3>Enterprise</h3>
                        <div className="plan-pricing">
                            <span className="plan-price">Custom</span>
                            <span className="plan-period">contact us</span>
                        </div>
                        <ul className="plan-features enterprise-features">
                            <li className="feature-tier">
                                <strong>All Tiers Include:</strong>
                            </li>
                            <li>
                                <svg className="feature-check" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Team Needs Assessment & Learning Plan Creation</span>
                            </li>
                            <li className="feature-tier">
                                <strong>Silver+ Tiers:</strong>
                            </li>
                            <li>
                                <svg className="feature-check" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Quarterly Invitation-Only Webinars</span>
                            </li>
                            <li>
                                <svg className="feature-check" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>10% Off Member Rate</span>
                            </li>
                            <li className="feature-tier">
                                <strong>Gold+ Tiers:</strong>
                            </li>
                            <li>
                                <svg className="feature-check" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>TD Capability Model & Skills Gap Assessment</span>
                            </li>
                            <li className="feature-tier">
                                <strong>Platinum Tier:</strong>
                            </li>
                            <li>
                                <svg className="feature-check" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Early Bird Conference Pricing</span>
                            </li>
                            <li>
                                <svg className="feature-check" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Research Center Access</span>
                            </li>
                            <li>
                                <svg className="feature-check" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>$10,000-$20,000 in Tailored Add-Ons</span>
                            </li>
                        </ul>
                        <a href="/contact-sales" className="select-plan-btn enterprise-btn">
                            Contact Sales
                        </a>
                    </div>
                </div>
            </div>

            {selectedPlan && (
                <div id="pricing-section" className="pricing-section">
                    <h2>Choose a Pricing Option</h2>
                    <div className="pricing-options">
                        {getPricingOptions().map((option) => (
                            <div 
                                key={option.id} 
                                className={`pricing-option ${selectedPricingOption === option.id ? 'selected' : ''}`}
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
                                />
                                <div className="pricing-option-content">
                                    <div className="pricing-info">
                                        {option.attributes?.name && (
                                            <h4 className="pricing-option-title">{option.attributes.name}</h4>
                                        )}
                                        {option.attributes?.description && (
                                            <p className="pricing-option-description">{option.attributes.description}</p>
                                        )}
                                    </div>
                                    <div className="pricing-details">
                                        <span className="price">
                                            {formatPriceForPricingOption(getSelectedPlan()!, option)}
                                        </span>
                                        <span className="interval">
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
                <div id="action-section" className="action-section">
                    <button
                        className="add-to-cart-btn"
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
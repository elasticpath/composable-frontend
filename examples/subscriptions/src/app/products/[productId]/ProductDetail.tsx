'use client';

import Image from 'next/image';
import { useState } from 'react';
import { addProductToCart } from './actions';
import { type ProductData } from "@epcc-sdk/sdks-shopper";
import Link from 'next/link';

interface ProductDetailProps {
  product: ProductData;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const handleAddToCart = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const result = await addProductToCart(product.data?.id!);
      
      if (result.success) {
        setMessage('Product added to cart successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'Failed to add product to cart');
      }
    } catch (error) {
      setMessage('An error occurred while adding to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const imageUrl = product.included?.main_images?.find((mainImage => {
    return mainImage.id === product.data?.relationships?.main_image?.data?.id
  }))?.link?.href ?? "/online-learning.jpg"

  const price = product.data?.meta?.display_price?.without_tax?.formatted ||
                'Price not available';

  // Extract product type from attributes or default
  const productType = product.data?.attributes?.commodity_type || 'Course';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="text-sm">
            <Link href="/" className="text-[#0066CC] hover:underline">Home</Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link href="/store" className="text-[#0066CC] hover:underline">Store</Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">{product.data?.attributes?.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Product Header */}
              <div className="p-6 border-b">
                <div className="flex items-start gap-4">
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <Image
                      src={imageUrl}
                      alt={product.data?.attributes?.name || 'Product image'}
                      fill
                      className="object-cover rounded-lg"
                      sizes="192px"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="inline-block px-3 py-1 bg-[#0E1521] text-white text-xs rounded-full">
                        {productType}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#0E1521] mb-3">
                      {product.data?.attributes?.name || 'Product Name'}
                    </h1>
                    {product.data?.attributes?.sku && (
                      <p className="text-sm text-gray-600">
                        Product Code: {product.data?.attributes.sku}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'overview' 
                        ? 'border-[#0E1521] text-[#0E1521]' 
                        : 'border-transparent text-gray-600 hover:text-[#0E1521]'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'details' 
                        ? 'border-[#0E1521] text-[#0E1521]' 
                        : 'border-transparent text-gray-600 hover:text-[#0E1521]'
                    }`}
                  >
                    Details
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="prose max-w-none">
                    {product.data?.attributes?.description ? (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: product.data.attributes.description 
                        }}
                        className="text-gray-700 leading-relaxed"
                      />
                    ) : (
                      <p className="text-gray-700">No description available for this product.</p>
                    )}
                  </div>
                )}
                
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#0E1521] mb-3">Product Details</h3>
                    <dl className="space-y-2">
                      {product.data?.attributes?.sku && (
                        <>
                          <dt className="font-medium text-gray-700">SKU:</dt>
                          <dd className="text-gray-600 ml-4">{product.data.attributes.sku}</dd>
                        </>
                      )}
                      <dt className="font-medium text-gray-700">Format:</dt>
                      <dd className="text-gray-600 ml-4">Online</dd>
                      <dt className="font-medium text-gray-700">Product Type:</dt>
                      <dd className="text-gray-600 ml-4">{productType}</dd>
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Box */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="space-y-4">
                {/* Price */}
                <div className="text-center py-4 border-b">
                  <p className="text-3xl font-bold text-[#0E1521]">
                    {price}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Member Price</p>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-[#E31837] text-white font-semibold rounded hover:bg-[#C71730] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {isLoading ? 'Adding to Cart...' : 'Add to Cart'}
                </button>

                {/* Success/Error Message */}
                {message && (
                  <div className={`p-3 rounded text-sm font-medium text-center ${
                    message.includes('success') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Additional Info */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#0E1521] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">Instant access upon purchase</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#0E1521] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">Self-paced learning</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#0E1521] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm text-gray-700">Certificate of completion</span>
                  </div>
                </div>

                {/* Member Benefits */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-[#0E1521] mb-1">Elastic Path Members Save More!</p>
                  <p className="text-xs text-gray-700">
                    <Link href="/subscriptions" className="text-[#0066CC] hover:underline">Join today</Link> to get exclusive member pricing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
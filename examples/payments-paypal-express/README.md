# PayPal Express Checkout Example

This example demonstrates how to integrate **PayPal Express Checkout** with **Elastic Path Commerce Cloud** in a Next.js storefront. It showcases a complete checkout flow with PayPal as the payment method.

## Key Features

- **PayPal Express Integration** – seamless checkout using PayPal's Express Checkout API
- **Server Actions** – secure payment processing using Next.js server actions
- **Complete Checkout Flow** – from cart to order confirmation with PayPal payment
- **Error Handling** – comprehensive error states for payment failures and cancellations
- **Order Status Management** – automatic order completion after successful PayPal payment

## Tech Stack

- [Elastic Path](https://www.elasticpath.com/products): Composable commerce platform
- [PayPal SDK](https://developer.paypal.com/sdk/js/): PayPal's JavaScript SDK for Express Checkout
- [Next.js](https://nextjs.org/): React framework with server-side capabilities
- [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework

## Setup Requirements

### 1. PayPal Configuration

Create a PayPal sandbox account and obtain your credentials:
- **Client ID** – for client-side SDK initialization
- **Client Secret** – for server-side API calls

### 2. Elastic Path Setup

Configure PayPal as a payment gateway in Commerce Manager:
1. Navigate to **Settings** → **Payments**
2. Add **PayPal Express Checkout** gateway
3. Configure with your PayPal credentials

### 3. Environment Variables

```bash
# Elastic Path
NEXT_PUBLIC_EPCC_CLIENT_ID=your-epcc-client-id
NEXT_PUBLIC_EPCC_ENDPOINT_URL=https://api.moltin.com
EPCC_CLIENT_SECRET=your-epcc-client-secret
```

## Implementation Highlights

### Payment Flow

1. **Checkout Initiation** – User proceeds to checkout with items in cart
2. **PayPal Order Creation** – Server creates a PayPal order matching the Elastic Path order
3. **PayPal Authorization** – User authorizes payment through PayPal
4. **Payment Capture** – Server captures the authorized payment
5. **Order Completion** – Elastic Path order is marked as complete

### Key Components

- `checkout/payment/[orderId]/page.tsx` – PayPal payment interface
- `checkout/actions.ts` – Server actions for payment processing
- `checkout/payment/[orderId]/actions.ts` – Handles PayPal payment confirmation

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and add items to cart to test the PayPal checkout flow.

## Current Feature Set

| **Feature**                  | **Status** | **Notes**                                           |
|------------------------------|------------|-----------------------------------------------------|
| PayPal Express Checkout      | ✅          | Full integration with order creation and capture    |
| Guest Checkout               | ✅          | No account required for purchase                    |
| Account Checkout             | ✅          | Registered users can checkout with saved details    |
| Error Handling               | ✅          | Comprehensive error states and user feedback        |
| Order Confirmation           | ✅          | Success page with order details                     |
| Payment Status Tracking      | ✅          | Real-time updates during payment process            |
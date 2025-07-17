# SPA Manual Payments Example

This example demonstrates how to handle manual payment processing in Elastic Path Commerce using the manual payment gateway. It focuses specifically on converting incomplete orders to complete orders through manual payment processing.

## Overview

This example builds upon the foundation of the spa-guest-checkout example but focuses narrowly on the payment handling aspect. Instead of showing a full storefront experience, it demonstrates:

1. **Creating an Incomplete Order** - A simple button that creates a test product, adds it to cart, checks out, and creates an incomplete order
2. **Manual Payment Processing** - Shows how to use Elastic Path's manual payment gateway to process payments for incomplete orders
3. **Order Completion** - Demonstrates converting an incomplete order to a complete order after payment processing

## Key Features

- Simplified UI focused on payment processing
- Manual payment gateway integration
- Order status management (incomplete → complete)
- Error handling for payment processing
- Real-time order status updates

## Manual Payment Gateway

The manual payment gateway in Elastic Path is designed for scenarios where payments are processed outside of the standard automated flow. This could include:

- Bank transfers
- Cash payments
- Check payments
- Manual credit card processing
- Custom payment workflows

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Configure your environment variables (copy from .env.example if available)

3. Start the development server:
   ```bash
   pnpm dev
   ```

## Flow

1. **Initialize** - Click "Create Incomplete Order" to generate a test order
2. **Process Payment** - Use the manual payment interface to mark the payment as received
3. **Complete Order** - The order status changes from incomplete to complete

## API Endpoints Used

- Cart management APIs for creating test orders
- Checkout API for order creation
- Manual payment gateway APIs for payment processing
- Order management APIs for status updates

## Learning Objectives

- Understanding manual payment gateway configuration
- Order state management in Elastic Path
- Payment processing workflows
- Error handling in payment scenarios

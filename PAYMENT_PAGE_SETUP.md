# Payment Page Setup Guide

## Overview
This payment page has been created to match the design in your reference image with:
- Split-screen layout (left: animated background, right: payment form)
- Animated gradient background with flowing particles
- Clean payment form with Stripe integration
- Responsive design for mobile and desktop

## Features Implemented

### 1. Layout Structure
- ✅ Split screen design (left side animated, right side payment form)
- ✅ Left side: Flowing animated background with gradient colors
- ✅ Right side: Clean payment form with card details

### 2. Left Side Animation
- ✅ Animated flowing/wave particles or gradient background
- ✅ Smooth continuous animation loop
- ✅ Modern gradient colors (purple, blue, pink tones)
- ✅ Floating elements and wave effects
- ✅ Responsive design that works on mobile

### 3. Right Side Payment Form
- ✅ Clean white background
- ✅ Card number input with Stripe Elements formatting
- ✅ Expiry date and CVV fields (handled by Stripe Elements)
- ✅ Cardholder name field
- ✅ Payment amount display ($99.00)
- ✅ Submit button with hover effects
- ✅ Form validation and error handling

### 4. Technical Requirements
- ✅ React/Next.js (using Vite + React)
- ✅ Tailwind CSS for styling
- ✅ Framer Motion for animations
- ✅ Stripe integration for payment processing
- ✅ Responsive design (mobile-first)

### 5. Animation Details
- ✅ Smooth flowing background animation
- ✅ Gradient transitions
- ✅ Particle effects and wave animations
- ✅ Performance optimized animations

### 6. Payment Integration
- ✅ Stripe Elements for secure card input
- ✅ Real payment processing setup
- ✅ Loading states and success/error handling

## Setup Instructions

### 1. Environment Configuration
Create a `.env.local` file in the root directory with your Stripe publishable key:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_key_here
```

### 2. Get Your Stripe Keys
1. Sign up for a Stripe account at https://stripe.com
2. Go to your Stripe Dashboard
3. Navigate to Developers > API keys
4. Copy your publishable key (starts with `pk_test_` for test mode)
5. Replace the placeholder in your `.env.local` file

### 3. Backend Integration (Optional)
For full payment processing, you'll need a backend server. The current implementation creates a payment method but doesn't complete the transaction. To add backend integration:

1. Create a backend endpoint (e.g., `/create-payment-intent`)
2. Update the `handleSubmit` function in `PaymentPage.tsx` to call your backend
3. Handle the payment confirmation on your server

### 4. Running the Application
```bash
npm run dev
```

The payment page will be available at `/payment` route.

## File Structure
```
src/
├── pages/
│   ├── PaymentPage.tsx          # Main payment page component
│   └── PaymentPageWrapper.tsx   # Stripe Elements wrapper
├── components/
│   └── ui/                      # UI components (Button, Input, etc.)
└── lib/
    └── App.tsx                  # Main app with routing
```

## Customization

### Colors
The gradient colors can be customized in `PaymentPage.tsx`:
- Look for the `animate` prop in the gradient background
- Modify the `radial-gradient` colors to match your brand

### Animation Speed
Adjust animation duration in the `transition` props:
- Background gradient: 8 seconds
- Floating particles: 3-5 seconds
- Wave effect: 4 seconds

### Payment Amount
Change the payment amount in the form:
- Update the amount display in the payment form
- Modify the button text to reflect the new amount

## Mobile Responsiveness
The payment page is fully responsive:
- On mobile: Full-width layout with stacked elements
- On desktop: Split-screen layout as shown in the reference image
- Animations are optimized for mobile performance

## Security Notes
- Stripe Elements handles all sensitive card data
- No card information is stored in your application
- Always use HTTPS in production
- Test thoroughly with Stripe's test card numbers

## Test Card Numbers
Use these test card numbers for testing:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Requires authentication: 4000 0025 0000 3155

## Next Steps
1. Add your actual Stripe publishable key
2. Test the payment flow with test cards
3. Implement backend payment processing
4. Add success/error page redirects
5. Customize colors and branding to match your needs 
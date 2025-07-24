// Example backend endpoint for validating Stripe coupons
// This should be implemented in your backend (Node.js/Express, Python, etc.)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/validate-coupon
async function validateCoupon(req, res) {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Coupon code is required' 
      });
    }

    // Retrieve the coupon from Stripe
    const coupon = await stripe.coupons.retrieve(couponCode);

    // Check if coupon is valid
    if (!coupon || coupon.valid === false) {
      return res.status(200).json({ 
        valid: false, 
        error: 'Invalid coupon code' 
      });
    }

    // Check if coupon has expired
    if (coupon.redeem_by && Date.now() > coupon.redeem_by * 1000) {
      return res.status(200).json({ 
        valid: false, 
        error: 'Coupon has expired' 
      });
    }

    // Check if coupon has reached maximum redemptions
    if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
      return res.status(200).json({ 
        valid: false, 
        error: 'Coupon has reached maximum redemptions' 
      });
    }

    // Calculate discount amount based on coupon type
    let discountAmount = 0;
    const baseAmount = 99.00; // Your base price

    if (coupon.percent_off) {
      // Percentage discount
      discountAmount = (baseAmount * coupon.percent_off) / 100;
    } else if (coupon.amount_off) {
      // Fixed amount discount (convert from cents to dollars)
      discountAmount = coupon.amount_off / 100;
    }

    return res.status(200).json({
      valid: true,
      coupon: {
        id: coupon.id,
        name: coupon.name,
        percent_off: coupon.percent_off,
        amount_off: coupon.amount_off,
        currency: coupon.currency,
        duration: coupon.duration,
        max_redemptions: coupon.max_redemptions,
        times_redeemed: coupon.times_redeemed
      },
      discountAmount: discountAmount,
      message: `Coupon applied! ${coupon.percent_off ? `${coupon.percent_off}% off` : `$${discountAmount} off`}`
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(200).json({ 
        valid: false, 
        error: 'Invalid coupon code' 
      });
    }

    return res.status(500).json({ 
      valid: false, 
      error: 'Server error while validating coupon' 
    });
  }
}

module.exports = { validateCoupon }; 
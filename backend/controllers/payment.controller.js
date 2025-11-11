// backend/controllers/paymentController.js

import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// ✅ Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc Create Stripe Payment Intent
 * @route POST /api/v1/payment/create-payment-intent
 * @access Private (user must be logged in)
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { course } = req.body;

    // 🧩 1️⃣ Validate course and price
    if (!course || !course.price) {
      return res.status(400).json({
        success: false,
        message: "Course details missing or invalid",
      });
    }

    let coursePrice = Number(course.price);

    // 🧠 Log the raw incoming price
    console.log("📦 Incoming course price:", coursePrice, "INR");

    // 🧮 2️⃣ Enforce Stripe minimum amount (>= ₹30)
    if (coursePrice < 30) {
      console.warn(`⚠️ Course price too low (₹${coursePrice}). Stripe requires ≥ ₹30.`);
      coursePrice = 30; // Force minimum allowed amount
    }

    // 🪙 3️⃣ Convert rupees to paise (Stripe expects smallest currency unit)
    const amountInPaise = Math.round(coursePrice * 100);

    // 🧠 Debug log
    console.log(`💰 Creating payment intent for ₹${coursePrice} (${amountInPaise} paise)`);

    // 💳 4️⃣ Create Stripe PaymentIntent (INR only)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise, // amount in paise
      currency: "inr", // ✅ always INR
      description: `Purchase of course: ${course.title || "Untitled Course"}`,
      automatic_payment_methods: { enabled: true },
    });

    // ✅ 5️⃣ Respond to frontend
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      fixedPrice: coursePrice,
    });
  } catch (error) {
    console.error("❌ Stripe Payment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
      error: error.message,
    });
  }
};

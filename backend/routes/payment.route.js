// backend/routes/payment.route.js

import express from "express";
import { createPaymentIntent } from "../controllers/payment.controller.js";
import userMiddleware from "../middlewares/user.mid.js"; // ✅ correct file name

const router = express.Router();

/**
 * @route   POST /api/v1/payment/create-payment-intent
 * @desc    Create a Stripe payment intent for a course
 * @access  Private (User must be logged in)
 */
router.post("/create-payment-intent", userMiddleware, createPaymentIntent);

export default router;

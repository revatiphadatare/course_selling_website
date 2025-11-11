// backend/controllers/order.controller.js

import { Order } from "../models/order.model.js";
import { Purchase } from "../models/purchase.model.js";

/**
 * @desc Save an order after successful payment (no Stripe call)
 * @route POST /api/v1/order
 * @access Private (User must be logged in)
 */
export const orderData = async (req, res) => {
  try {
    const { email, userId, courseId, paymentId, amount, status } = req.body;

    // 🧩 Validate incoming data
    if (!email || !userId || !courseId || !paymentId || !amount || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required order fields",
      });
    }

    console.log("🧾 Creating new order...");
    console.log({
      userId,
      courseId,
      paymentId,
      amount,
      status,
    });

    // ✅ 1️⃣ Save Order
    const order = await Order.create({
      userId,
      courseId,
      paymentId,
      amount,
      status,
    });

    // ✅ 2️⃣ Record purchase (optional)
    const purchase = await Purchase.create({
      userId,
      courseId,
      orderId: order._id,
      paymentId,
      amount,
      status,
    });

    console.log("✅ Order saved successfully:", order._id);

    res.status(201).json({
      success: true,
      message: "Order saved successfully",
      order,
      purchase,
    });
  } catch (error) {
    console.error("❌ Error saving order:", error);
    res.status(500).json({
      success: false,
      message: "Error saving order",
      error: error.message,
    });
  }
};

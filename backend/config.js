import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD;
const JWT_ADMIN_PASSWORD = process.env.JWT_ADMIN_PASSWORD;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const stripe = new Stripe(STRIPE_SECRET_KEY);

export default {
  JWT_USER_PASSWORD,
  JWT_ADMIN_PASSWORD,
  STRIPE_SECRET_KEY,
  stripe,
};
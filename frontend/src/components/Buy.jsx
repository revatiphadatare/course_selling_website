import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { BACKEND_URL } from "../utils/utils";

function Buy() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState({});
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [cardError, setCardError] = useState("");
  const navigate = useNavigate();

  const stripe = useStripe();
  const elements = useElements();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch course + create payment intent
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true);

        // Fetch courses
        const courseRes = await axios.get(`${BACKEND_URL}/course/courses`, {
          withCredentials: true,
        });

        const selectedCourse = courseRes.data.courses?.find(
          (c) => c._id === courseId
        );

        if (!selectedCourse) throw new Error("Course not found");

        setCourse(selectedCourse);

        // Create Payment Intent
        const paymentRes = await axios.post(
          `${BACKEND_URL}/payment/create-payment-intent`,
          { course: selectedCourse },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        console.log("✅ Payment Intent Response:", paymentRes.data);
        setClientSecret(paymentRes.data.clientSecret);
      } catch (err) {
        console.error("❌ Error creating payment intent:", err);
        setError("Failed to initialize payment. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [courseId, token]);

  // Handle Payment Submission
  const handlePurchase = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe not initialized properly");
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      toast.error("Card element not found");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create Payment Method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card,
      });

      if (methodError) {
        setCardError(methodError.message);
        setLoading(false);
        return;
      }

      console.log("[PaymentMethod Created]", paymentMethod);

      // 2️⃣ Confirm Payment
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card,
            billing_details: {
              name: user?.user?.firstName || "Anonymous User",
              email: user?.user?.email,
            },
          },
        }
      );

      if (confirmError) {
        setCardError(confirmError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        console.log("✅ Payment succeeded:", paymentIntent);
        toast.success("Payment successful!");

        // 3️⃣ Save order to backend
        const paymentInfo = {
          email: user?.user?.email,
          userId: user.user._id,
          courseId,
          paymentId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // convert back to ₹
          status: paymentIntent.status,
        };

        await axios.post(`${BACKEND_URL}/order`, paymentInfo, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        navigate("/purchases");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Something went wrong during payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error ? (
        <div className="flex justify-center items-center h-screen">
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg text-center">
            <p className="text-lg font-semibold mb-3">{error}</p>
            <Link
              to="/purchases"
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-200"
            >
              Go to Purchases
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row my-40 container mx-auto gap-10">
          {/* Order Summary */}
          <div className="w-full md:w-1/2 bg-gray-900 text-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold underline mb-6">Order Summary</h1>
            {loading ? (
              <p>Loading course details...</p>
            ) : (
              <>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">Course Name:</span>
                  <span className="text-orange-400 font-semibold">{course.title}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-green-400 font-semibold">₹{course.price}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">Discount:</span>
                  <span className="text-green-500 font-semibold">20% OFF</span>
                </div>
              </>
            )}
          </div>

          {/* Payment Section */}
          <div className="w-full md:w-1/2 flex justify-center items-center">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Process your Payment</h2>

              <form onSubmit={handlePurchase}>
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": { color: "#aab7c4" },
                      },
                      invalid: { color: "#9e2146" },
                    },
                  }}
                />
                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="mt-6 w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 transition duration-200"
                >
                  {loading ? "Processing..." : "Pay Now"}
                </button>
              </form>

              {cardError && (
                <p className="text-red-500 font-semibold text-sm mt-3">{cardError}</p>
              )}

              <button
                type="button"
                className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition duration-200 mt-3"
              >
                🅿️ Other Payment Methods
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Buy;

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { initPaddle } from "../utils/paddle";

const PaddleCheckout = ({
  priceId,
  type = "subscription",
  isAnnual = false,
  ctaText = "Purchase"
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paddle, setPaddle] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const paddleInstance = await initPaddle();
        setPaddle(paddleInstance);
      } catch (error) {
        console.error("Failed to initialize Paddle:", error);
      }
    };
    initialize();
  }, []);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login?redirect=/pricing");
      return;
    }

    if (!paddle) {
      console.error("Paddle not initialized");
      return;
    }

    if (!priceId) {
      console.error("No price ID provided");
      return;
    }

    setLoading(true);

    try {
      const checkoutConfig = {
        items: [{ priceId, quantity: 1 }],
        customer: { 
          email: user.email 
        },
        customData: { 
          userId: user.uid, 
          isAnnual: isAnnual.toString(),
          type: type
        },
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: "en"
        },
        eventCallback: (event) => {
          if (event.name === "checkout.completed") {
            setLoading(false);
            // Navigate based on type
            if (type === "subscription") {
              navigate("/welcome?plan=pro&trial=true");
            } else {
              navigate("/profile?purchase=success");
            }
          } else if (event.name === "checkout.closed") {
            setLoading(false);
          } else if (event.name === "checkout.error") {
            console.error("Checkout error:", event.data);
            setLoading(false);
          }
        }
      };

      paddle.Checkout.open(checkoutConfig);
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || !paddle}
      className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl text-center w-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Processing...
        </>
      ) : (
        ctaText
      )}
    </button>
  );
};

export default PaddleCheckout;
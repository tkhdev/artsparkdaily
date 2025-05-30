import React, { useState, useEffect, useRef } from "react";
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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const checkoutTimeoutRef = useRef(null);
  const safetyTimeoutRef = useRef(null);

  useEffect(() => {
    const handlePaddleEvent = (event) => {
      console.log("Paddle event:", event);

      // Clear timeouts
      clearTimeout(checkoutTimeoutRef.current);
      clearTimeout(safetyTimeoutRef.current);
      checkoutTimeoutRef.current = null;
      safetyTimeoutRef.current = null;

      switch (event.name) {
        case "checkout.completed":
          handleSuccess(type);
          break;
        case "checkout.closed":
          resetLoadingState();
          break;
        case "checkout.error":
          setError("Payment failed. Please try again or contact support.");
          resetLoadingState();
          break;
        case "checkout.loaded":
          console.log("Checkout overlay loaded");
          break;
        case "checkout.warning":
          console.warn("Checkout warning:", event.data);
          break;
        default:
          console.log("Unhandled Paddle event:", event.name);
      }
    };

    const initialize = async () => {
      try {
        const paddleInstance = await initPaddle(handlePaddleEvent);
        setPaddle(paddleInstance);
      } catch (error) {
        console.error("Failed to initialize Paddle:", error);
        setError("Payment system unavailable. Please try again later.");
      }
    };

    initialize();

    return () => {
      clearTimeout(checkoutTimeoutRef.current);
      clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  const resetLoadingState = () => {
    setLoading(false);
    setError(null);
    clearTimeout(checkoutTimeoutRef.current);
    clearTimeout(safetyTimeoutRef.current);
    checkoutTimeoutRef.current = null;
    safetyTimeoutRef.current = null;
  };

  const handleSuccess = (type) => {
    console.log("Payment success handler triggered");
    setSuccess(true);
    resetLoadingState();
    setTimeout(() => {
      navigate(type === "subscription" ? "/welcome?plan=pro&trial=true" : "/profile?purchase=success", {
        replace: true,
      });
    }, 1000);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login?redirect=/pricing");
      return;
    }

    if (!paddle) {
      setError("Payment system not ready. Please try again.");
      return;
    }

    if (!priceId) {
      setError("Invalid product configuration. Please contact support.");
      return;
    }

    setLoading(true);
    setError(null);

    checkoutTimeoutRef.current = setTimeout(() => {
      console.warn("Checkout timeout – no activity");
      resetLoadingState();
    }, 5000);

    safetyTimeoutRef.current = setTimeout(() => {
      console.warn("Safety timeout – force reset");
      resetLoadingState();
    }, 30000);

    try {
      const checkoutResult = paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: user.email },
        customData: { userId: user.uid, isAnnual: isAnnual.toString(), type },
        successUrl: "http://localhost:5173/",
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: "en"
        },
      });

      if (checkoutResult?.catch) {
        checkoutResult.catch((err) => {
          console.error("Checkout open error:", err);
          resetLoadingState();
          setError("Failed to open payment window. Please try again.");
        });
      }

      const onFocus = () => {
        setTimeout(() => {
          if (loading) {
            console.log("Window refocus detected – assuming popup was closed");
            resetLoadingState();
          }
        }, 1000);
      };

      window.addEventListener("focus", onFocus);
      setTimeout(() => window.removeEventListener("focus", onFocus), 30000);
    } catch (error) {
      console.error("Checkout init error:", error);
      resetLoadingState();
      setError("Failed to start payment. Please try again.");
    }
  };

  const retryCheckout = () => {
    setError(null);
    handleCheckout();
  };

  if (error) {
    return (
      <div className="space-y-2">
        <button
          onClick={retryCheckout}
          disabled={loading || !paddle}
          className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl w-full transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Processing...</>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Payment
            </>
          )}
        </button>
        <p className="text-red-400 text-sm text-center">{error}</p>
      </div>
    );
  }

  if (!paddle) {
    return (
      <button
        disabled
        className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl w-full opacity-50 flex items-center justify-center gap-2"
      >
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || success}
      className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl w-full transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {success ? (
        <>
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Success! Redirecting...
        </>
      ) : loading ? (
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

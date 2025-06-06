import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { initPaddle } from "../utils/paddle";
import { useOwnUserProfile } from "../hooks/useOwnUserProfile";
import Confetti from "react-confetti";

const PaddleCheckout = ({
  priceId,
  type = "subscription",
  isAnnual = false,
  ctaText = "Purchase"
}) => {
  const { user } = useAuth();
  const { refetchProfile } = useOwnUserProfile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paddle, setPaddle] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const checkoutTimeoutRef = useRef(null);
  const safetyTimeoutRef = useRef(null);
  const paddleRef = useRef(null);

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
          // Close the checkout immediately using paddleRef
          if (paddleRef.current) {
            paddleRef.current.Checkout.close();
          }
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
        paddleRef.current = paddleInstance;
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
  }, []); // Removed paddle from dependencies

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
    setShowConfetti(true);
    resetLoadingState();
    setTimeout(() => {
      setShowConfetti(false);
      setSuccess(false);
      refetchProfile();
      navigate(
        type === "subscription"
          ? "/welcome?plan=pro&trial=true"
          : "/profile?purchase=success",
        {
          replace: true
        }
      );
    }, 5000);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login?redirect=/pricing");
      return;
    }

    if (!paddleRef.current) {
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
      const checkoutResult = paddleRef.current.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: user.email },
        customData: { userId: user.uid, isAnnual: isAnnual.toString(), type },
        successUrl: "http://localhost:5173/",
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: "en"
        }
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

  // Success overlay component rendered via portal
  const SuccessOverlay = () => {
    if (!success) return null;

    return createPortal(
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={300}
            gravity={0.2}
            colors={["#ff00ff", "#00ff00", "#0000ff", "#ffff00", "#ff0000"]}
          />
        )}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-pink-500/30 rounded-3xl p-8 text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Purchase Successful!
          </h3>
          <p className="text-gray-300 mb-6">
            {type === "subscription"
              ? "Welcome to Art Spark Pro! Redirecting..."
              : "Your add-on has been added! Redirecting..."}
          </p>
        </div>
      </div>,
      document.body
    );
  };

  if (error) {
    return (
      <div className="space-y-2">
        <button
          onClick={retryCheckout}
          disabled={loading || !paddleRef.current}
          className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl w-full transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>{" "}
              Processing...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retry Payment
            </>
          )}
        </button>
        <p className="text-red-400 text-sm text-center">{error}</p>
      </div>
    );
  }

  if (!paddleRef.current) {
    return (
      <button
        disabled
        className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl w-full opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        Loading...
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleCheckout}
        disabled={loading || success}
        className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl w-full transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
      <SuccessOverlay />
    </>
  );
};

export default PaddleCheckout;
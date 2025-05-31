import React, { useState, useMemo } from "react";
import { FontAwesomeIcon as FontAwesome } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faStar,
  faArrowRight,
  faBolt,
  faPalette,
  faCrown,
  faInfinity,
  faMagic,
  faClock
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import PaddleCheckout from "../../components/PaddleCheckout";
import { useOwnUserProfile } from "../../hooks/useOwnUserProfile";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { profile } = useOwnUserProfile();

  // Determine user status
  const userStatus = useMemo(() => {
    if (!profile) return "not_signed_in";

    if (profile.plan === "pro") {
      if (profile.subscriptionStatus === "trialing" || profile.isTrialActive) {
        return "on_trial";
      }
      return "pro";
    }

    return "signed_in_free";
  }, [profile]);

  // Get appropriate CTA text and action based on user status
  const getFreePlanCTA = () => {
    switch (userStatus) {
      case "not_signed_in":
        return {
          text: "Get Started Free",
          action: () => (window.location.href = "/signup")
        };
      case "signed_in_free":
        return {
          text: "Current Plan",
          action: null,
          disabled: true
        };
      case "on_trial":
        return {
          text: "Your Previous Plan",
          action: null,
          disabled: true
        };
      case "pro":
        return {
          text: "Downgrade to Free",
          action: () => (window.location.href = "/account/billing")
        };
      default:
        return {
          text: "Get Started Free",
          action: () => (window.location.href = "/signup")
        };
    }
  };

  const getProPlanCTA = () => {
    switch (userStatus) {
      case "not_signed_in":
      case "signed_in_free":
        return {
          text: "Start Pro Trial",
          showPaddle: true
        };
      case "on_trial":
        return {
          text: "Current Plan (Trial)",
          showPaddle: false,
          disabled: true
        };
      case "pro":
        return {
          text: "Current Plan",
          showPaddle: false,
          disabled: true
        };
      default:
        return {
          text: "Start Pro Trial",
          showPaddle: true
        };
    }
  };

  const plans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      description: "Perfect for getting started with AI art",
      features: [
        "1 submission per challenge",
        "5 prompt attempts per day",
        "Basic community interaction",
        "Daily AI-generated prompts",
        "Public gallery access",
        "Basic achievements"
      ],
      ...getFreePlanCTA(),
      popular: false,
      gradient: "from-slate-600 to-slate-700"
    },
    {
      name: "Art Spark Pro",
      price: isAnnual ? "39.99" : "4.99",
      period: isAnnual ? "year" : "month",
      originalPrice: isAnnual ? "59.88" : null,
      description: "Unlock your full creative potential",
      features: [
        "50 prompt attempts per challenge",
        "Advanced prompt customization",
        "Highlighted profile & submissions",
        "Monthly Pro-only challenges",
        "Extra achievements & badges",
        "Save & organize favorite prompts",
        "Ad-free experience",
        "Priority support"
      ],
      priceId: isAnnual
        ? "pri_01jwec4skf2yxcjen28n8sy0s3"
        : "pri_01jwec3qcv96d5ceymh7dfe45x",
      popular:
        userStatus === "not_signed_in" || userStatus === "signed_in_free",
      gradient: "from-pink-600 to-purple-600",
      ...getProPlanCTA()
    }
  ];

  const addOns = [
    {
      name: "Extra Prompt Attempts",
      price: "0.99",
      description: "10 additional attempts for any challenge",
      icon: faBolt,
      priceId: "pri_01jwec6pyjmpcrawsytnb0zvqz"
    }
  ];

  // Get user-specific hero message
  const getHeroMessage = () => {
    switch (userStatus) {
      case "not_signed_in":
        return "Choose the perfect plan to fuel your daily creative journey";
      case "signed_in_free":
        return "Ready to unlock your full creative potential?";
      case "on_trial":
        const trialEndDate = profile?.subscriptionEndDate
          ? new Date(profile.subscriptionEndDate).toLocaleDateString()
          : "";
        return `Your Pro trial ${
          trialEndDate ? `ends on ${trialEndDate}` : "is active"
        }. Upgrade to continue enjoying Pro features!`;
      case "pro":
        return "You're already enjoying the full Art Spark Pro experience!";
      default:
        return "Choose the perfect plan to fuel your daily creative journey";
    }
  };

  // Get status badge for current user
  const getCurrentStatusBadge = () => {
    if (userStatus === "on_trial") {
      return (
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-full text-lg font-bold flex items-center gap-3 shadow-xl">
            <FontAwesome icon={faClock} />
            Pro Trial Active
            <FontAwesome icon={faMagic} />
          </div>
        </div>
      );
    } else if (userStatus === "pro") {
      return (
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full text-lg font-bold flex items-center gap-3 shadow-xl">
            <FontAwesome icon={faCrown} />
            Pro Member
            <FontAwesome icon={faMagic} />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-pulse">
                Pricing
              </span>
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 to-purple-400/20 blur-xl rounded-full"></div>
          </div>

          {getCurrentStatusBadge()}

          <p className="text-gray-300 text-xl md:text-2xl font-light max-w-3xl mx-auto leading-relaxed mb-8">
            {getHeroMessage()}
          </p>

          {/* Billing Toggle - only show if user can upgrade */}
          {(userStatus === "not_signed_in" ||
            userStatus === "signed_in_free") && (
            <div className="flex items-center justify-center gap-4 mb-12">
              <span
                className={`text-lg font-medium ${
                  !isAnnual ? "text-white" : "text-gray-400"
                }`}
              >
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-16 h-8 rounded-full transition-colors cursor-pointer ${
                  isAnnual
                    ? "bg-gradient-to-r from-pink-500 to-purple-600"
                    : "bg-slate-600"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    isAnnual ? "translate-x-8" : "translate-x-0"
                  }`}
                ></div>
              </button>
              <span
                className={`text-lg font-medium ${
                  isAnnual ? "text-white" : "text-gray-400"
                }`}
              >
                Annual
              </span>
              {isAnnual && (
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold ml-2">
                  Save 33%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className="relative">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <FontAwesome icon={faStar} />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="group relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
                <div
                  className={`relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border-2 ${
                    plan.popular
                      ? "border-pink-500/50"
                      : plan.disabled
                      ? "border-green-500/50"
                      : "border-white/10"
                  } rounded-3xl p-8 h-full flex flex-col ${
                    plan.disabled ? "opacity-90" : ""
                  }`}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-400 mb-6">{plan.description}</p>

                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-black text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-400 text-lg">
                        /{plan.period}
                      </span>
                    </div>

                    {plan.originalPrice && (
                      <div className="text-gray-500 text-lg line-through">
                        Originally ${plan.originalPrice}/{plan.period}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 mb-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start gap-3"
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FontAwesome
                              icon={faCheck}
                              className="text-white text-xs"
                            />
                          </div>
                          <span className="text-gray-300 text-lg">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  {plan.name === "Free" ? (
                    <button
                      onClick={plan.action}
                      disabled={plan.disabled}
                      className={`group relative overflow-hidden bg-gradient-to-r ${
                        plan.disabled
                          ? "from-green-600 to-green-700 cursor-not-allowed"
                          : plan.gradient + " hover:scale-105 cursor-pointer"
                      } text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl text-center w-full transition-all flex items-center justify-center gap-2`}
                    >
                      <span className="relative z-10">{plan.text}</span>
                      {!plan.disabled && <FontAwesome icon={faArrowRight} />}
                      {plan.disabled && <FontAwesome icon={faCheck} />}
                    </button>
                  ) : plan.showPaddle ? (
                    <PaddleCheckout
                      priceId={plan.priceId}
                      type="subscription"
                      isAnnual={isAnnual}
                      ctaText={plan.text}
                    />
                  ) : (
                    <button
                      disabled={true}
                      className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl text-center w-full cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span className="relative z-10">{plan.text}</span>
                      <FontAwesome icon={faCheck} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              One-Time Add-Ons
            </h2>
            <p className="text-gray-400 text-xl">
              Enhance your experience with optional extras
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
            {addOns.map((addon, index) => (
              <div key={index} className="relative">
                <div className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
                  <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesome
                        icon={addon.icon}
                        className="text-white text-2xl"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {addon.name}
                    </h3>
                    <p className="text-gray-400 mb-4">{addon.description}</p>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-4">
                      ${addon.price}
                    </div>
                    <PaddleCheckout
                      priceId={addon.priceId}
                      type="one-time"
                      ctaText="Add to Cart"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Comparison - only show for non-pro users */}
        {userStatus !== "pro" && (
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-16">
            <h3 className="text-3xl font-bold text-white text-center mb-8">
              Why Choose Art Spark Pro?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesome
                    icon={faInfinity}
                    className="text-white text-3xl"
                  />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Unlimited Creativity
                </h4>
                <p className="text-gray-400">
                  50 attempts per challenge means endless experimentation
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesome
                    icon={faPalette}
                    className="text-white text-3xl"
                  />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Advanced Tools
                </h4>
                <p className="text-gray-400">
                  Customize prompts with themes, styles, and more
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesome icon={faCrown} className="text-white text-3xl" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  VIP Experience
                </h4>
                <p className="text-gray-400">
                  Stand out with highlighted submissions and exclusive
                  challenges
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pro User Thank You Section */}
        {userStatus === "pro" && (
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-sm border border-pink-500/30 rounded-3xl p-8 mb-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesome icon={faCrown} className="text-white text-4xl" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Thank You for Being Pro!
            </h3>
            <p className="text-gray-300 text-xl mb-6">
              You're enjoying all the premium features Art Spark has to offer.
              Keep creating amazing art and inspiring the community!
            </p>
            <Link
              to="/account/billing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:scale-105 transition-all"
            >
              Manage Subscription
              <FontAwesome icon={faArrowRight} />
            </Link>
          </div>
        )}

        {/* FAQ Section */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-8">
            Questions About Pricing?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/faq"
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2">
                View FAQ
                <FontAwesome icon={faArrowRight} />
              </span>
            </Link>

            <Link
              to="/contact"
              className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 text-lg font-semibold border-2 border-pink-500/30 px-8 py-4 rounded-2xl flex items-center gap-2 cursor-pointer"
            >
              Contact Support
              <FontAwesome icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PricingPage;
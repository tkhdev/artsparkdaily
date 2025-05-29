import React, { useState } from "react";
import { FontAwesomeIcon as FontAwesome } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I sign up for Art Spark Daily?",
      answer: "You can sign up using your Google account via our secure Firebase Authentication system. Click 'Sign Up' on the homepage to get started.",
    },
    {
      question: "What are daily prompts?",
      answer: "Every day at 00:00 UTC, we release a new AI-generated creative prompt using the Pollinations API. You can use it to inspire your art and submit to the gallery.",
    },
    {
      question: "How do prompt attempts work?",
      answer: "Free users get 5 attempts per daily challenge to generate art with the Pollinations API. Art Spark Pro users get 15 attempts with advanced customization options.",
    },
    {
      question: "How do I submit to the gallery?",
      answer: "After creating art with your prompt attempts, select one piece to submit to the public gallery for each daily challenge. Only authenticated users can submit.",
    },
    {
      question: "How is the daily winner chosen?",
      answer: "The submission with the most likes by the end of the day wins. In case of a tie, the earliest submission timestamp determines the winner.",
    },
    {
      question: "What are achievements?",
      answer: "Achievements like 'First Spark' or 'Weekly Streak' reward your participation. Earn them by submitting art, getting likes, or commenting.",
    },
    {
      question: "How do notifications work?",
      answer: "You'll receive notifications for new prompts, likes/comments on your submissions, and achievements. Opt-in for reminders about unused prompt attempts.",
    },
    {
      question: "What does Art Spark Pro offer?",
      answer: "The Pro plan includes 15 prompt attempts, ad-free experience, exclusive challenges, and more.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-pulse">
                FAQ
              </span>
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 to-purple-400/20 blur-xl rounded-full"></div>
          </div>
          <p className="text-gray-300 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about Art Spark Daily
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-6 mb-16">
          {faqs.map((faq, index) => (
            <div key={index} className="relative">
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                  <button
                    className="w-full flex justify-between items-center text-left gap-4 cursor-pointer"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-${index}`}
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white flex-1">
                      {faq.question}
                    </h2>
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <FontAwesome
                        icon={openIndex === index ? faChevronUp : faChevronDown}
                        className="text-white text-sm"
                      />
                    </div>
                  </button>
                  
                  {openIndex === index && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <p id={`faq-${index}`} className="text-gray-300 text-lg leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Highlight */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Need More Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">24/7 Support</div>
              <div className="text-gray-400">We're here to help anytime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">Quick Response</div>
              <div className="text-gray-400">Usually within a few hours</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 mb-2">Community</div>
              <div className="text-gray-400">Ask fellow artists for tips</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-bold text-white mb-8">Still Have Questions?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/contact"
              className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl"
              aria-label="Contact us for more help"
            >
              <span className="relative z-10 flex items-center gap-2">
                Contact Us
                <FontAwesome icon={faArrowRight} />
              </span>
            </Link>
            
            <Link
              to="/how-it-works"
              className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 text-lg font-semibold border-2 border-pink-500/30 px-8 py-4 rounded-2xl flex items-center gap-2"
              aria-label="Learn how Art Spark Daily works"
            >
              Learn How It Works
              <FontAwesome icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FAQPage;
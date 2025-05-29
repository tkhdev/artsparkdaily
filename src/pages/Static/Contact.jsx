import React, { useState } from "react";
import { FontAwesomeIcon as FontAwesome } from "@fortawesome/react-fontawesome";
import { faEnvelope, faComments } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase-config";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sendContactMessage = httpsCallable(functions, "sendContactMessage");

    try {
      const result = await sendContactMessage(formData);
      console.log("Message sent:", result.data);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error.message);
      alert("Failed to send message. Please try again later.");
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 rounded-3xl shadow-2xl text-gray-100 my-10 select-none">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Contact Us
          </span>
        </h1>
        <p className="text-pink-300 text-lg">
          Reach out for support or feedback
        </p>
      </div>

      {/* Contact Form */}
      <div className="bg-gradient-to-r from-pink-900/60 to-purple-900/60 border border-pink-600/30 rounded-2xl p-6 md:p-8 transition-transform duration-300 hover:scale-[1.015]">
        <div className="flex items-center gap-3 mb-6">
          <FontAwesome
            icon={faEnvelope}
            className="text-2xl text-pink-400 drop-shadow-lg"
          />
          <h2 className="text-2xl font-bold text-white">Send Us a Message</h2>
        </div>

        {submitted ? (
          <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 text-green-300 text-base font-medium">
            ✅ Thank you for your message! We’ll get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="text-pink-300 block mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-pink-900/60 border border-pink-600/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="text-pink-300 block mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-pink-900/60 border border-pink-600/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="text-pink-300 block mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full bg-pink-900/60 border border-pink-600/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-xl text-lg font-semibold transition-all duration-200"
            >
              ✉️ Send Message
            </button>
          </form>
        )}
      </div>

      {/* Additional Contact Info */}
      <div className="bg-gradient-to-r from-pink-900/60 to-purple-900/60 border border-pink-600/30 rounded-2xl p-6 md:p-8 mt-10 transition-transform duration-300 hover:scale-[1.015]">
        <div className="flex items-center gap-3 mb-4">
          <FontAwesome
            icon={faComments}
            className="text-2xl text-pink-400 drop-shadow-lg"
          />
          <h2 className="text-2xl font-bold text-white">
            Other Ways to Connect
          </h2>
        </div>

        <p className="text-pink-300 mb-4">
          Email us at{" "}
          <a
            href="mailto:support@artsparkdaily.com"
            className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
          >
            artsparkdaily@gmail.com
          </a>{" "}
          or follow us on social media for updates and community discussions.
        </p>

        <div className="flex flex-wrap gap-6 items-center mb-4">
          <a
            href="https://twitter.com/"
            className="text-pink-400 hover:text-pink-300 text-sm font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            🐦 Twitter
          </a>
          <a
            href="https://instagram.com/"
            className="text-pink-400 hover:text-pink-300 text-sm font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            📸 Instagram
          </a>
        </div>

        <Link
          to="/faq"
          className="text-pink-400 hover:text-pink-300 text-sm font-semibold underline underline-offset-2"
        >
          Visit our FAQ for quick answers →
        </Link>
      </div>
    </main>
  );
};

export default ContactUs;

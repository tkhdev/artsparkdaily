import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { analytics, logEvent } from "./firebase-config";
import { AuthProvider } from "./context/AuthContext";

import Layout from "./components/Layout/Layout";
import Home from "./pages/Home/Home";
import Gallery from "./pages/Gallery/Gallery";
import UserProfile from "./pages/UserProfile/UserProfile";
import Dev from "./pages/Dev/Dev";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import SubmissionDetail from "./pages/Submission/Submission";
import Notifications from "./pages/Notifications/Notifications";
import AboutPage from "./pages/Static/About";
import HowItWorks from "./pages/Static/HowItWorks";
import FAQPage from "./pages/Static/Faq";
import TermsOfService from "./pages/Static/TermsOfServivce";
import PrivacyPolicy from "./pages/Static/PrivacyPolicy";
import ContactUs from "./pages/Static/Contact";
import PricingPage from "./pages/Static/Pricing";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  useEffect(() => {
    // Log a page view event correctly
    logEvent(analytics, "page_view");
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/dev" element={<Dev />} />
            <Route path="/profile/:uid?" element={<UserProfile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route
              path="/submission/:submissionId"
              element={<SubmissionDetail />}
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;

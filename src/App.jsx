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

function App() {
  useEffect(() => {
    // Log a page view event correctly
    logEvent(analytics, "page_view");
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/dev" element={<Dev />} />
            <Route path="/profile/:uid?" element={<UserProfile />} />
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

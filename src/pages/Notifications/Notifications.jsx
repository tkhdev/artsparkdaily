import React, { useState, useEffect } from "react";
import { FontAwesomeIcon as FontAwesome } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faComment,
  faThumbsUp,
  faTrophy,
  faLightbulb,
  faSpinner,
  faExclamationCircle,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import {
  db,
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  where
} from "../../firebase-config";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const notificationIcons = {
  comment: { icon: faComment, color: "text-green-400" },
  like: { icon: faThumbsUp, color: "text-blue-400" },
  winner: { icon: faTrophy, color: "text-yellow-400" },
  achievement: { icon: faLightbulb, color: "text-purple-400" },
  prompt: { icon: faBell, color: "text-pink-400" }
};

const NotificationCard = ({ notification, onMarkAsRead }) => {
  const {
    type,
    title,
    message,
    createdAt,
    read,
    relatedChallengeId,
    relatedSubmissionId
  } = notification;
  const iconData = notificationIcons[type] || {
    icon: faBell,
    color: "text-pink-400"
  };

  return (
    <div
      className={`bg-gradient-to-r ${
        read
          ? "from-pink-900/30 to-purple-900/30 border border-pink-600/30"
          : "from-pink-900/60 to-purple-900/60 border-2 border-pink-500"
      } rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl flex items-start gap-4`}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-800/60">
        <FontAwesome
          icon={iconData.icon}
          className={`text-xl ${iconData.color} drop-shadow-lg`}
        />
      </div>

      {/* Notification Content */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-pink-300 text-base">{message}</p>
        <p className="text-sm text-gray-400 mt-1">
          {new Date(createdAt).toLocaleString()}
        </p>
        {(relatedChallengeId || relatedSubmissionId) && (
          <div className="mt-2">
            {relatedSubmissionId && (
              <Link
                to={`/submission/${relatedSubmissionId}`}
                className="text-pink-400 hover:text-pink-300 text-sm font-semibold"
              >
                View Submission
              </Link>
            )}
            {relatedChallengeId && !relatedSubmissionId && (
              <Link
                to={`/challenge/${relatedChallengeId}`}
                className="text-pink-400 hover:text-pink-300 text-sm font-semibold"
              >
                View Challenge
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      {!read && (
        <button
          onClick={() => onMarkAsRead(notification.id)}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-1 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          Mark as Read
        </button>
      )}
      {read && (
        <div className="text-green-400 text-sm font-semibold flex items-center gap-1">
          <FontAwesome icon={faCheckCircle} />
          Read
        </div>
      )}
    </div>
  );
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch user-specific notifications from Firestore
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(notificationsQuery);
      const fetchedNotifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate() // Convert Firestore timestamp to JS Date
      }));

      setNotifications(fetchedNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, { read: true });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to update notification. Please try again.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 rounded-3xl shadow-2xl text-gray-100 my-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FontAwesome
              icon={faSpinner}
              className="text-4xl animate-spin text-pink-400 mb-4"
            />
            <p className="text-pink-300 text-lg">Loading notifications...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 rounded-3xl shadow-2xl text-gray-100 my-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FontAwesome
              icon={faExclamationCircle}
              className="text-4xl text-red-400 mb-4"
            />
            <p className="text-red-300 text-lg mb-4">{error}</p>
            <button
              onClick={fetchNotifications}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 rounded-3xl shadow-2xl text-gray-100 my-8 select-none">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Notifications
          </span>
        </h1>
        <p className="text-pink-300 text-lg">
          Stay updated with your creative journey
        </p>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <FontAwesome
              icon={faBell}
              className="text-4xl text-pink-400 mb-4"
            />
            <p className="text-pink-300 text-lg">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </div>
    </main>
  );
}

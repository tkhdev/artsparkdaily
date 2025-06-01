import React, { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon as FontAwesome } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faComment,
  faThumbsUp,
  faTrophy,
  faLightbulb,
  faSpinner,
  faExclamationCircle,
  faCheckCircle,
  faCheck,
  faEye,
  faFilter,
  faRefresh,
  faInbox,
} from "@fortawesome/free-solid-svg-icons";
import {
  db,
  collection,
  getDocs,
  getDoc,
  query,
  orderBy,
  updateDoc,
  doc,
  where,
  limit,
  startAfter,
  writeBatch,
  increment,
  serverTimestamp,
} from "../../firebase-config";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NOTIFICATIONS_PER_PAGE = 10;

const notificationIcons = {
  comment: { icon: faComment, color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
  like: { icon: faThumbsUp, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  winner: { icon: faTrophy, color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  achievement: { icon: faLightbulb, color: "text-purple-400", bgColor: "bg-purple-500/20" },
  prompt: { icon: faBell, color: "text-pink-400", bgColor: "bg-pink-500/20" },
  subscription: { icon: faBell, color: "text-pink-400", bgColor: "bg-pink-500/20" },
  billing: { icon: faBell, color: "text-pink-400", bgColor: "bg-pink-500/20" },
  purchase: { icon: faBell, color: "text-pink-400", bgColor: "bg-pink-500/20" },
};

const NotificationCard = ({ notification, onMarkAsRead, isAnimating }) => {
  const { type, title, message, createdAt, read, relatedChallengeId, relatedSubmissionId } = notification;
  const iconData = notificationIcons[type] || {
    icon: faBell,
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`group relative overflow-hidden transition-all duration-500 ease-out transform ${
        isAnimating ? "animate-pulse" : ""
      } ${
        read
          ? "bg-gradient-to-r from-slate-800/40 to-slate-700/40 border border-slate-600/30 hover:from-slate-800/60 hover:to-slate-700/60"
          : "bg-gradient-to-r from-pink-900/50 to-purple-900/50 border-2 border-pink-500/50 hover:border-pink-400 shadow-lg shadow-pink-500/20"
      } rounded-2xl p-6 hover:scale-[1.02] hover:shadow-2xl backdrop-blur-sm`}
    >
      {!read && (
        <div className="absolute top-4 right-4 w-3 h-3 bg-pink-500 rounded-full animate-pulse shadow-lg shadow-pink-500/50"></div>
      )}
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl ${iconData.bgColor} border border-white/10 shadow-inner`}
        >
          <FontAwesome
            icon={iconData.icon}
            className={`text-xl ${iconData.color} drop-shadow-lg group-hover:scale-110 transition-transform duration-200`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3
                className={`text-lg font-bold mb-2 leading-tight ${read ? "text-gray-300" : "text-white"}`}
              >
                {title}
              </h3>
              <p
                className={`text-base leading-relaxed mb-3 ${read ? "text-gray-400" : "text-pink-200"}`}
              >
                {message}
              </p>
              {(relatedChallengeId || relatedSubmissionId) && (
                <div className="flex gap-3 mb-3">
                  {relatedSubmissionId && (
                    <Link
                      to={`/submission/${relatedSubmissionId}`}
                      className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 text-sm font-semibold hover:underline transition-colors"
                    >
                      <FontAwesome icon={faEye} className="text-xs" />
                      View Submission
                    </Link>
                  )}
                  {relatedChallengeId && !relatedSubmissionId && (
                    <Link
                      to={`/challenge/${relatedChallengeId}`}
                      className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 text-sm font-semibold hover:underline transition-colors"
                    >
                      <FontAwesome icon={faEye} className="text-xs" />
                      View Challenge
                    </Link>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{formatTimeAgo(new Date(createdAt))}</span>
                <span>•</span>
                <span>{new Date(createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {!read ? (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="group/btn flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <FontAwesome
                    icon={faCheck}
                    className="text-xs group-hover/btn:rotate-12 transition-transform duration-200"
                  />
                  Mark Read
                </button>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                  <FontAwesome icon={faCheckCircle} className="text-xs" />
                  Read
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterButton = ({ active, onClick, children, count = 0 }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
      active
        ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
        : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
    }`}
  >
    {children}
    {count > 0 && (
      <span
        className={`ml-1 px-2 py-0.5 text-xs rounded-full ${active ? "bg-white/20" : "bg-pink-500/20 text-pink-400"}`}
      >
        {count}
      </span>
    )}
  </button>
);

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({ totalCount: 0, unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'read'
  const [markingAsRead, setMarkingAsRead] = useState(new Set());
  const { user } = useAuth();

  const observerRef = useRef();
  const loadingRef = useRef();

  // Fetch notification counts
  const fetchCounts = async () => {
    try {
      const summaryRef = doc(db, "users", user.uid, "notificationSummary", "summary");
      const summaryDoc = await getDoc(summaryRef);
      if (summaryDoc.exists()) {
        setCounts(summaryDoc.data());
      } else {
        setCounts({ totalCount: 0, unreadCount: 0 });
      }
    } catch (err) {
      console.error("Error fetching notification counts:", err);
      setError("Failed to load notification counts.");
    }
  };

  // Stats for filter buttons
  const unreadCount = counts.unreadCount;
  const totalCount = counts.totalCount;

  // Filtered notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  // Fetch notifications with pagination
  const fetchNotifications = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      let notificationsQuery = query(
        collection(db, "users", user.uid, "notifications"),
        orderBy("createdAt", "desc"),
        limit(NOTIFICATIONS_PER_PAGE)
      );

      if (isLoadMore && lastDoc) {
        notificationsQuery = query(
          collection(db, "users", user.uid, "notifications"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(NOTIFICATIONS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(notificationsQuery);
      const fetchedNotifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      }));

      if (isLoadMore) {
        setNotifications((prev) => [...prev, ...fetchedNotifications]);
      } else {
        setNotifications(fetchedNotifications);
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === NOTIFICATIONS_PER_PAGE);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Mark notification as read with optimistic update
  const handleMarkAsRead = async (notificationId) => {
    setMarkingAsRead((prev) => new Set([...prev, notificationId]));

    // Optimistic update
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif))
    );
    setCounts((prev) => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));

    try {
      const notificationRef = doc(db, "users", user.uid, "notifications", notificationId);
      const summaryRef = doc(db, "users", user.uid, "notificationSummary", "summary");
      const batch = writeBatch(db); // Use writeBatch instead of db.batch
      batch.update(notificationRef, { read: true });
      batch.update(summaryRef, {
        unreadCount: increment(-1), // Use increment from modular SDK
        lastUpdated: serverTimestamp(), // Use serverTimestamp from modular SDK
      });
      await batch.commit();
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Revert optimistic update
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, read: false } : notif))
      );
      setCounts((prev) => ({
        ...prev,
        unreadCount: prev.unreadCount + 1,
      }));
      setError("Failed to update notification. Please try again.");
    } finally {
      setMarkingAsRead((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setCounts((prev) => ({ ...prev, unreadCount: 0 }));

    try {
      const batch = writeBatch(db); // Use writeBatch instead of db.batch
      unreadNotifications.forEach((notification) => {
        batch.update(doc(db, "users", user.uid, "notifications", notification.id), {
          read: true,
        });
      });
      batch.update(doc(db, "users", user.uid, "notificationSummary", "summary"), {
        unreadCount: 0,
        lastUpdated: serverTimestamp(), // Use serverTimestamp from modular SDK
      });
      await batch.commit();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError("Failed to mark all as read. Please try again.");
      // Revert on error
      fetchNotifications();
      fetchCounts();
    }
  };

  // Intersection Observer for lazy loading
  const lastNotificationRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            fetchNotifications(true);
          }
        },
        { threshold: 0.1 }
      );
      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchCounts();
    }
  }, [user]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl text-gray-100 my-8 min-h-[600px]">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="relative">
              <FontAwesome
                icon={faSpinner}
                className="text-5xl animate-spin text-pink-400 mb-6"
              />
              <div className="absolute inset-0 text-5xl text-pink-600/30 animate-ping">
                <FontAwesome icon={faBell} />
              </div>
            </div>
            <p className="text-pink-300 text-xl font-medium">Loading your notifications...</p>
            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl text-gray-100 my-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <FontAwesome icon={faExclamationCircle} className="text-5xl text-red-400 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
            <p className="text-red-300 text-lg mb-6">{error}</p>
            <button
              onClick={() => {
                fetchNotifications();
                fetchCounts();
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FontAwesome icon={faRefresh} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl text-gray-100 my-8 select-none">
      <div className="text-center mb-12">
        <div className="relative inline-block">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
            Notifications
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-20"></div>
        </div>
        <p className="text-pink-300 text-xl font-medium">
          Stay connected with your creative community
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
        <div className="flex flex-wrap gap-3">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")} count={totalCount}>
            <FontAwesome icon={faInbox} />
            All
          </FilterButton>
          <FilterButton
            active={filter === "unread"}
            onClick={() => setFilter("unread")}
            count={unreadCount}
          >
            <FontAwesome icon={faBell} />
            Unread
          </FilterButton>
          <FilterButton
            active={filter === "read"}
            onClick={() => setFilter("read")}
            count={totalCount - unreadCount}
          >
            <FontAwesome icon={faCheckCircle} />
            Read
          </FilterButton>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
          >
            <FontAwesome icon={faCheck} />
            Mark All Read
          </button>
        )}
      </div>
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              <FontAwesome
                icon={filter === "unread" ? faBell : faCheckCircle}
                className="text-6xl text-pink-400/60"
              />
              {filter === "all" && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-pink-500 rounded-full animate-bounce"></div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {filter === "unread"
                ? "All caught up!"
                : filter === "read"
                ? "No read notifications"
                : "No notifications yet"}
            </h3>
            <p className="text-pink-300 text-lg">
              {filter === "unread"
                ? "You have no unread notifications."
                : filter === "read"
                ? "No notifications have been read yet."
                : "New notifications will appear here."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <div
              key={notification.id}
              ref={index === filteredNotifications.length - 1 ? lastNotificationRef : null}
            >
              <NotificationCard
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                isAnimating={markingAsRead.has(notification.id)}
              />
            </div>
          ))
        )}
      </div>
      {loadingMore && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-pink-300">
            <FontAwesome icon={faSpinner} className="animate-spin" />
            <span>Loading more notifications...</span>
          </div>
        </div>
      )}
      {!hasMore && notifications.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-gray-400 text-sm bg-white/5 px-4 py-2 rounded-full">
            <FontAwesome icon={faCheckCircle} />
            You've reached the end
          </div>
        </div>
      )}
    </main>
  );
}
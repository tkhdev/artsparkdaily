import React, { useState, useEffect } from "react";
import { FontAwesomeIcon as FontAwesome } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faMedal,
  faFire,
  faHeart,
  faImage,
  faStar,
  faThumbsUp,
  faCrown,
  faComment,
  faLightbulb,
  faCalendar,
  faSpinner,
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import {
  db,
  collection,
  getDocs,
  limit,
  orderBy,
  query
} from "../../firebase-config";
import { Link } from "react-router-dom";

const achievementData = {
  first_spark: { icon: faStar, label: "First Spark", color: "text-yellow-400" },
  weekly_streak: {
    icon: faFire,
    label: "Weekly Streak",
    color: "text-orange-400"
  },
  crowd_favorite: {
    icon: faThumbsUp,
    label: "Crowd Favorite",
    color: "text-blue-400"
  },
  critic: { icon: faComment, label: "Critic", color: "text-green-400" },
  innovator: {
    icon: faLightbulb,
    label: "Innovator",
    color: "text-purple-400"
  },
  seasonal: { icon: faCalendar, label: "Seasonal", color: "text-pink-400" }
};

const LeaderboardCard = ({ user, rank, category }) => {
  const getRankIcon = (rank) => {
    if (rank === 1) return { icon: faTrophy, color: "text-yellow-400" };
    if (rank === 2) return { icon: faMedal, color: "text-gray-300" };
    if (rank === 3) return { icon: faMedal, color: "text-orange-400" };
    return null;
  };

  const getCategoryValue = (user, category) => {
    switch (category) {
      case "likes":
        return user.totalLikes?.toLocaleString() || "0";
      case "submissions":
        return user.totalSubmissions?.toLocaleString() || "0";
      default:
        return "";
    }
  };

  const rankIcon = getRankIcon(rank);

  return (
    <div
      className={`bg-gradient-to-r ${
        rank <= 3
          ? "from-pink-900/80 to-purple-900/80 border-2 border-pink-500"
          : "from-pink-900/40 to-purple-900/40 border border-pink-600/50"
      } rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-800/60">
          {rankIcon ? (
            <FontAwesome
              icon={rankIcon.icon}
              className={`text-xl ${rankIcon.color} drop-shadow-lg`}
            />
          ) : (
            <span className="text-xl font-bold text-pink-200">#{rank}</span>
          )}
        </div>

        {/* Profile Picture */}
        <div className="relative">
          <Link to={`/profile/${user.id}`}>
            <img
              src={
                user.profilePic ||
                user.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`
              }
              alt={user.displayName}
              className="w-16 h-16 rounded-full border-3 border-pink-500 object-cover"
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`;
              }}
            />
          </Link>
          {user.isPro && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <FontAwesome icon={faCrown} className="text-xs text-white" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <Link to={`/profile/${user.id}`}>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              {user.displayName || "Anonymous"}
              {user.isPro && (
                <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full font-semibold">
                  PRO
                </span>
              )}
            </h3>
          </Link>
          <p className="text-pink-300 text-lg font-semibold">
            {getCategoryValue(user, category)}
          </p>

          {/* Achievements */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {user.topAchievements?.slice(0, 4).map((achievement, i) => {
              const achData = achievementData[achievement.id];
              if (!achData) return null;
              return (
                <div key={i} className="relative group">
                  <FontAwesome
                    icon={achData.icon}
                    className={`text-sm ${achData.color} hover:scale-125 transition-transform cursor-help`}
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {achData.label}
                  </div>
                </div>
              );
            })}
            {(user.achievementsCount || 0) > 4 && (
              <span className="text-xs text-pink-400 font-semibold">
                +{(user.achievementsCount || 0) - 4}
              </span>
            )}
          </div>
        </div>

        {/* Category Icon */}
        <div className="text-pink-400 text-2xl opacity-60">
          {category === "likes" && <FontAwesome icon={faHeart} />}
          {category === "submissions" && <FontAwesome icon={faImage} />}
        </div>
      </div>
    </div>
  );
};

export default function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState("likes");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalSubmissions: 0
  });

  // Fetch leaderboard data based on category
  const fetchLeaderboardData = async (category) => {
    try {
      setLoading(true);
      setError(null);

      let sortField,
        sortDirection = "desc";

      switch (category) {
        case "likes":
          sortField = "totalLikes";
          break;
        case "submissions":
          sortField = "totalSubmissions";
          break;
        default:
          sortField = "totalLikes";
      }

      // Create optimized query - limit to top performers only
      const usersQuery = query(
        collection(db, "users"),
        orderBy(sortField, sortDirection),
        limit(50) // Limit to top 50 for performance
      );

      const querySnapshot = await getDocs(usersQuery);
      const fetchedUsers = [];

      // Process users and fetch their achievements in parallel
      const userPromises = querySnapshot.docs.map(async (doc) => {
        const userData = { id: doc.id, ...doc.data() };

        // Fetch top achievements for each user (limit to reduce reads)
        try {
          const achievementsQuery = query(
            collection(db, `users/${doc.id}/achievements`),
            orderBy("unlockedAt", "desc"),
            limit(5)
          );
          const achievementsSnapshot = await getDocs(achievementsQuery);
          userData.topAchievements = achievementsSnapshot.docs.map((achDoc) =>
            achDoc.data()
          );
        } catch (err) {
          console.warn(`Failed to fetch achievements for user ${doc.id}:`, err);
          userData.topAchievements = [];
        }

        return userData;
      });

      const processedUsers = await Promise.all(userPromises);

      setUsers(processedUsers);

      // Calculate stats from top users (approximate for performance)
      const calculatedStats = {
        totalLikes: processedUsers.reduce(
          (sum, user) => sum + (user.totalLikes || 0),
          0
        ),
        totalSubmissions: processedUsers.reduce(
          (sum, user) => sum + (user.totalSubmissions || 0),
          0
        )
      };
      setStats(calculatedStats);
    } catch (err) {
      console.error("Error fetching leaderboard data:", err);
      setError("Failed to load leaderboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData(activeCategory);
  }, [activeCategory]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const categories = [
    { key: "likes", label: "Total Likes", icon: faHeart },
    { key: "submissions", label: "Submissions", icon: faImage }
  ];

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 rounded-3xl shadow-2xl text-gray-100 my-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FontAwesome
              icon={faSpinner}
              className="text-4xl animate-spin text-pink-400 mb-4"
            />
            <p className="text-pink-300 text-lg">Loading leaderboard...</p>
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
              onClick={() => fetchLeaderboardData(activeCategory)}
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
            Leaderboard
          </span>
        </h1>
        <p className="text-pink-300 text-lg">
          Celebrating our most creative and dedicated artists
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categories.map((category) => {
          return (
            <button
              key={category.key}
              onClick={() => handleCategoryChange(category.key)}
              disabled={loading}
              className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                activeCategory === category.key
                  ? "bg-gradient-to-r from-pink-600 to-purple-700 text-white shadow-lg scale-105"
                  : "bg-pink-900/40 text-pink-300 hover:bg-pink-800/60 hover:text-white border border-pink-600/50"
              }`}
            >
              <FontAwesome icon={category.icon} />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Top 3 Podium */}
      {users.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {users.slice(0, 3).map((user, index) => {
            const rank = index + 1;
            const podiumHeight =
              rank === 1 ? "h-32" : rank === 2 ? "h-24" : "h-20";
            const podiumColors = {
              1: "from-yellow-500/20 to-yellow-600/20 border-yellow-400",
              2: "from-gray-400/20 to-gray-500/20 border-gray-300",
              3: "from-orange-500/20 to-orange-600/20 border-orange-400"
            };

            return (
              <div
                key={user.id}
                className={`text-center ${
                  rank === 2
                    ? "md:order-first"
                    : rank === 1
                    ? "md:order-2"
                    : "md:order-3"
                }`}
              >
                {/* User Avatar and Info */}
                <div className="mb-4">
                  <div className="relative inline-block">
                    <Link to={`/profile/${user.id}`}>
                      <img
                        src={
                          user.profilePic ||
                          user.photoURL ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`
                        }
                        alt={user.displayName}
                        className="w-20 h-20 rounded-full border-4 border-pink-500 object-cover mx-auto"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`;
                        }}
                      />
                    </Link>
                    {user.isPro && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <FontAwesome
                          icon={faCrown}
                          className="text-sm text-white"
                        />
                      </div>
                    )}
                  </div>
                  <Link to={`/profile/${user.id}`}>
                    <h3 className="text-lg font-bold text-white mt-2">
                      {user.displayName || "Anonymous"}
                    </h3>
                  </Link>
                  <p className="text-pink-300 font-semibold">
                    {activeCategory === "likes" &&
                      `${(user.totalLikes || 0).toLocaleString()} likes`}
                    {activeCategory === "submissions" &&
                      `${user.totalSubmissions || 0} submissions`}
                  </p>
                </div>

                {/* Podium */}
                <div
                  className={`${podiumHeight} bg-gradient-to-t ${podiumColors[rank]} border-2 rounded-t-lg flex items-end justify-center pb-4`}
                >
                  <div className="text-center">
                    {rank === 1 ? (
                      <FontAwesome
                        icon={faTrophy}
                        className="text-2xl text-yellow-400 mb-2"
                      />
                    ) : (
                      <FontAwesome
                        icon={faMedal}
                        className={`text-2xl mb-2 ${
                          rank === 2 ? "text-gray-300" : "text-orange-400"
                        }`}
                      />
                    )}
                    <div className="text-2xl font-bold text-white">#{rank}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-pink-300 mb-6">Full Rankings</h2>
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-pink-300 text-lg">
              No users found for this category.
            </p>
          </div>
        ) : (
          users.map((user, index) => (
            <LeaderboardCard
              key={user.id}
              user={user}
              rank={index + 1}
              category={activeCategory}
            />
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
        <div className="bg-pink-900/60 rounded-2xl p-6">
          <FontAwesome icon={faHeart} className="text-2xl text-pink-400 mb-2" />
          <h3 className="text-xl font-bold text-white">Total Likes</h3>
          <p className="text-2xl font-bold text-pink-300">
            {stats.totalLikes.toLocaleString()}+
          </p>
        </div>
        <div className="bg-pink-900/60 rounded-2xl p-6">
          <FontAwesome
            icon={faImage}
            className="text-2xl text-purple-400 mb-2"
          />
          <h3 className="text-xl font-bold text-white">Total Submissions</h3>
          <p className="text-2xl font-bold text-purple-300">
            {stats.totalSubmissions.toLocaleString()}+
          </p>
        </div>
      </div>
    </main>
  );
}

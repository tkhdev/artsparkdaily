import React, { useState, useEffect, useCallback, useRef } from "react";
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
  faExclamationCircle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  db,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "../../firebase-config";
import { Link } from "react-router-dom";

const USERS_PER_PAGE = 10;

const achievementData = {
  first_spark: { icon: faStar, label: "First Spark", color: "text-yellow-400" },
  weekly_streak: { icon: faFire, label: "Weekly Streak", color: "text-orange-400" },
  crowd_favorite: { icon: faThumbsUp, label: "Crowd Favorite", color: "text-blue-400" },
  critic: { icon: faComment, label: "Critic", color: "text-green-400" },
  innovator: { icon: faLightbulb, label: "Innovator", color: "text-purple-400" },
  seasonal: { icon: faCalendar, label: "Seasonal", color: "text-pink-400" },
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
      case "likes": return user.totalLikes?.toLocaleString() || "0";
      case "submissions": return user.totalSubmissions?.toLocaleString() || "0";
      default: return "";
    }
  };

  const rankIcon = getRankIcon(rank);

  return (
    <div
      className={`bg-gradient-to-r ${
        rank <= 3
          ? "from-pink-900/80 to-purple-900/80 border-2 border-pink-500"
          : "from-slate-900/50 to-purple-900/50 border border-pink-600/50"
      } rounded-2xl p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm`}
      role="listitem"
      aria-label={`Rank ${rank} for ${user.displayName || "Anonymous"} in ${category}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-800/60 border border-white/10">
          {rankIcon ? (
            <FontAwesome
              icon={rankIcon.icon}
              className={`text-xl ${rankIcon.color} drop-shadow-lg transition-transform duration-200`}
            />
          ) : (
            <span className="text-xl font-bold text-pink-200">#{rank}</span>
          )}
        </div>

        <div className="relative">
          <Link to={`/profile/${user.id}`} aria-label={`View profile of ${user.displayName || "Anonymous"}`}>
            <img
              src={
                user.profilePic ||
                user.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`
              }
              alt={user.displayName || "Anonymous"}
              className="w-16 h-16 rounded-full border-3 border-pink-500 object-cover"
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`;
              }}
              loading="lazy"
            />
          </Link>
          {user.plan === "pro" && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <FontAwesome icon={faCrown} className="text-xs text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link to={`/profile/${user.id}`}>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2 truncate">
              {user.displayName || "Anonymous"}
              {user.plan === "pro" && (
                <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full font-semibold">
                  PRO
                </span>
              )}
            </h3>
          </Link>
          <p className="text-pink-300 text-lg font-semibold">{getCategoryValue(user, category)}</p>

          <div className="flex gap-2 mt-2 flex-wrap">
            {user.topAchievements?.slice(0, 4).map((achievement, i) => {
              const achData = achievementData[achievement.id];
              if (!achData) return null;
              return (
                <div key={i} className="relative group">
                  <FontAwesome
                    icon={achData.icon}
                    className={`text-sm ${achData.color} hover:scale-125 transition-transform cursor-help`}
                    aria-label={achData.label}
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
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

        <div className="text-pink-400 text-2xl opacity-60">
          {category === "likes" && <FontAwesome icon={faHeart} />}
          {category === "submissions" && <FontAwesome icon={faImage} />}
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-gradient-to-r from-slate-900/50 to-purple-900/50 rounded-2xl p-6 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-pink-800/60"></div>
      <div className="w-16 h-16 rounded-full bg-gray-700/50"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 w-3/4 bg-gray-700/50 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-700/50 rounded"></div>
        <div className="flex gap-2">
          <div className="w-4 h-4 bg-gray-700/50 rounded-full"></div>
          <div className="w-4 h-4 bg-gray-700/50 rounded-full"></div>
        </div>
      </div>
      <div className="w-6 h-6 bg-gray-700/50 rounded-full"></div>
    </div>
  </div>
);

export default function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState("likes");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [stats, setStats] = useState({ totalLikes: 0, totalSubmissions: 0 });
  const observerRef = useRef();
  const timeoutRef = useRef();

  const fetchLeaderboardData = async (category, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      let sortField;
      const sortDirection = "desc";

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

      let usersQuery = query(
        collection(db, "users"),
        orderBy(sortField, sortDirection),
        limit(USERS_PER_PAGE)
      );

      if (isLoadMore && lastDoc) {
        usersQuery = query(
          collection(db, "users"),
          orderBy(sortField, sortDirection),
          startAfter(lastDoc),
          limit(USERS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(usersQuery);
      const fetchedUsers = [];

      const userPromises = querySnapshot.docs.map(async (doc) => {
        const userData = { id: doc.id, ...doc.data() };
        try {
          const achievementsQuery = query(
            collection(db, `users/${doc.id}/achievements`),
            orderBy("unlockedAt", "desc"),
            limit(5)
          );
          const achievementsSnapshot = await getDocs(achievementsQuery);
          userData.topAchievements = achievementsSnapshot.docs.map((achDoc) => achDoc.data());
        } catch (err) {
          console.warn(`Failed to fetch achievements for user ${doc.id}:`, err);
          userData.topAchievements = [];
        }
        return userData;
      });

      const processedUsers = await Promise.all(userPromises);

      if (isLoadMore) {
        setUsers((prev) => [...prev, ...processedUsers]);
      } else {
        setUsers(processedUsers);
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === USERS_PER_PAGE);

      const calculatedStats = {
        totalLikes: processedUsers.reduce((sum, user) => sum + (user.totalLikes || 0), 0),
        totalSubmissions: processedUsers.reduce((sum, user) => sum + (user.totalSubmissions || 0), 0),
      };
      setStats((prev) => ({
        totalLikes: isLoadMore ? prev.totalLikes + calculatedStats.totalLikes : calculatedStats.totalLikes,
        totalSubmissions: isLoadMore
          ? prev.totalSubmissions + calculatedStats.totalSubmissions
          : calculatedStats.totalSubmissions,
      }));
    } catch (err) {
      console.error("Error fetching leaderboard data:", err);
      setError("Failed to load leaderboard data. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const debounce = (func, wait) => {
    return (...args) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => func(...args), wait);
    };
  };

  const handleCategoryChange = useCallback(
    debounce((category) => {
      setUsers([]);
      setLastDoc(null);
      setHasMore(true);
      setActiveCategory(category);
      fetchLeaderboardData(category);
    }, 300),
    []
  );

  const lastUserRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            fetchLeaderboardData(activeCategory, true);
          }
        },
        { threshold: 0.1 }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore, activeCategory]
  );

  useEffect(() => {
    fetchLeaderboardData(activeCategory);
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [activeCategory]);

  const categories = [
    { key: "likes", label: "Total Likes", icon: faHeart },
    { key: "submissions", label: "Submissions", icon: faImage },
  ];

  if (loading && users.length === 0) {
    return (
      <main className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl text-gray-100 my-8 min-h-[600px]">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="relative">
              <FontAwesome icon={faSpinner} className="text-5xl animate-spin text-pink-400 mb-6" />
              <div className="absolute inset-0 text-5xl text-pink-600/30 animate-ping">
                <FontAwesome icon={faTrophy} />
              </div>
            </div>
            <p className="text-pink-300 text-xl font-medium">Loading leaderboard...</p>
            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
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
              onClick={() => fetchLeaderboardData(activeCategory)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FontAwesome icon={faSpinner} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl text-gray-100 my-8 select-none"
      role="main"
      aria-label="Leaderboard"
    >
      <div className="text-center mb-12">
        <div className="relative inline-block">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-pulse">
            Leaderboard
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-20 animate-pulse"></div>
        </div>
        <p className="text-pink-300 text-xl font-medium">Celebrating our most creative and dedicated artists</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-8 p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => handleCategoryChange(category.key)}
            disabled={loading || loadingMore}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeCategory === category.key
                ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-pressed={activeCategory === category.key}
          >
            <FontAwesome icon={category.icon} />
            {category.label}
          </button>
        ))}
      </div>

      {users.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {users.slice(0, 3).map((user, index) => {
            const rank = index + 1;
            const podiumHeight = rank === 1 ? "h-32" : rank === 2 ? "h-24" : "h-20";
            const podiumColors = {
              1: "from-yellow-500/20 to-yellow-600/20 border-yellow-400",
              2: "from-gray-400/20 to-gray-500/20 border-gray-300",
              3: "from-orange-500/20 to-orange-600/20 border-orange-400",
            };

            return (
              <div
                key={user.id}
                className={`text-center ${
                  rank === 2 ? "md:order-first" : rank === 1 ? "md:order-2" : "md:order-3"
                } animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
                role="listitem"
                aria-label={`Podium rank ${rank} for ${user.displayName || "Anonymous"}`}
              >
                <div className="mb-4">
                  <div className="relative inline-block">
                    <Link to={`/profile/${user.id}`}>
                      <img
                        src={
                          user.profilePic ||
                          user.photoURL ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`
                        }
                        alt={user.displayName || "Anonymous"}
                        className="w-20 h-20 rounded-full border-4 border-pink-500 object-cover mx-auto"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`;
                        }}
                        loading="lazy"
                      />
                    </Link>
                    {user.plan === "pro" && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <FontAwesome icon={faCrown} className="text-sm text-white" />
                      </div>
                    )}
                  </div>
                  <Link to={`/profile/${user.id}`}>
                    <h3 className="text-lg font-bold text-white mt-2 truncate">
                      {user.displayName || "Anonymous"}
                    </h3>
                  </Link>
                  <p className="text-pink-300 font-semibold">
                    {activeCategory === "likes" && `${(user.totalLikes || 0).toLocaleString()} likes`}
                    {activeCategory === "submissions" && `${user.totalSubmissions || 0} submissions`}
                  </p>
                </div>

                <div
                  className={`${podiumHeight} bg-gradient-to-t ${podiumColors[rank]} border-2 rounded-t-lg flex items-end justify-center pb-4`}
                >
                  <div className="text-center">
                    {rank === 1 ? (
                      <FontAwesome icon={faTrophy} className="text-2xl text-yellow-400 mb-2" />
                    ) : (
                      <FontAwesome
                        icon={faMedal}
                        className={`text-2xl mb-2 ${rank === 2 ? "text-gray-300" : "text-orange-400"}`}
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

      <div className="space-y-4" role="list" aria-label="Full leaderboard rankings">
        <h2 className="text-2xl font-bold text-pink-300 mb-6">Full Rankings</h2>
        {users.length === 0 ? (
          <div className="text-center py-16">
            <FontAwesome icon={faTrophy} className="text-6xl text-pink-400/60 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No rankings yet</h3>
            <p className="text-pink-300 text-lg">No users found for this category.</p>
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user.id}
              ref={index === users.length - 1 ? lastUserRef : null}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <LeaderboardCard user={user} rank={index + 1} category={activeCategory} />
            </div>
          ))
        )}
        {loadingMore && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
      </div>

      {loadingMore && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-pink-300">
            <FontAwesome icon={faSpinner} className="animate-spin" />
            <span>Loading more rankings...</span>
          </div>
        </div>
      )}

      {!hasMore && users.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-gray-400 text-sm bg-white/5 px-4 py-2 rounded-full">
            <FontAwesome icon={faCheckCircle} />
            You've reached the end
          </div>
        </div>
      )}

      {hasMore && users.length > 0 && (
        <div className="text-center py-8">
          <button
            onClick={() => fetchLeaderboardData(activeCategory, true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={loadingMore}
          >
            <FontAwesome icon={faSpinner} className={loadingMore ? "animate-spin" : "hidden"} />
            Load More
          </button>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
        <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
          <FontAwesome icon={faHeart} className="text-2xl text-pink-400 mb-2" />
          <h3 className="text-xl font-bold text-white">Total Likes</h3>
          <p className="text-2xl font-bold text-pink-300">{stats.totalLikes.toLocaleString()}+</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
          <FontAwesome icon={faImage} className="text-2xl text-purple-400 mb-2" />
          <h3 className="text-xl font-bold text-white">Total Submissions</h3>
          <p className="text-2xl font-bold text-purple-300">{stats.totalSubmissions.toLocaleString()}+</p>
        </div>
      </div>
    </main>
  );
}
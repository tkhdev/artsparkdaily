import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  faCalendarAlt
} from "@fortawesome/free-solid-svg-icons";

// Mock data - in real app this would come from Firebase/API
const mockUsers = [
  {
    uid: "1",
    displayName: "ArtMaster2024",
    profilePic: "https://i.pravatar.cc/150?img=1",
    totalLikes: 2847,
    totalSubmissions: 156,
    currentStreak: 45,
    achievements: ["first-spark", "weekly-streak", "crowd-favorite", "critic", "innovator"],
    isPro: true
  },
  {
    uid: "2", 
    displayName: "PixelDreamer",
    profilePic: "https://i.pravatar.cc/150?img=2",
    totalLikes: 2156,
    totalSubmissions: 142,
    currentStreak: 32,
    achievements: ["first-spark", "weekly-streak", "crowd-favorite"],
    isPro: true
  },
  {
    uid: "3",
    displayName: "NeonCreative",
    profilePic: "https://i.pravatar.cc/150?img=3",
    totalLikes: 1923,
    totalSubmissions: 98,
    currentStreak: 28,
    achievements: ["first-spark", "weekly-streak", "critic"],
    isPro: false
  },
  {
    uid: "4",
    displayName: "VibrantVisions",
    profilePic: "https://i.pravatar.cc/150?img=4",
    totalLikes: 1745,
    totalSubmissions: 134,
    currentStreak: 21,
    achievements: ["first-spark", "weekly-streak", "crowd-favorite", "innovator"],
    isPro: true
  },
  {
    uid: "5",
    displayName: "DigitalDreams",
    profilePic: "https://i.pravatar.cc/150?img=5",
    totalLikes: 1634,
    totalSubmissions: 87,
    currentStreak: 19,
    achievements: ["first-spark", "weekly-streak"],
    isPro: false
  },
  {
    uid: "6",
    displayName: "ChromaticSoul",
    profilePic: "https://i.pravatar.cc/150?img=6",
    totalLikes: 1512,
    totalSubmissions: 76,
    currentStreak: 15,
    achievements: ["first-spark", "critic"],
    isPro: false
  },
  {
    uid: "7",
    displayName: "AIArtisan",
    profilePic: "https://i.pravatar.cc/150?img=7",
    totalLikes: 1398,
    totalSubmissions: 65,
    currentStreak: 12,
    achievements: ["first-spark", "weekly-streak", "innovator"],
    isPro: true
  },
  {
    uid: "8",
    displayName: "CosmicCanvas",
    profilePic: "https://i.pravatar.cc/150?img=8",
    totalLikes: 1256,
    totalSubmissions: 58,
    currentStreak: 8,
    achievements: ["first-spark"],
    isPro: false
  }
];

const achievementData = {
  "first-spark": { icon: faStar, label: "First Spark", color: "text-yellow-400" },
  "weekly-streak": { icon: faFire, label: "Weekly Streak", color: "text-orange-400" },
  "crowd-favorite": { icon: faThumbsUp, label: "Crowd Favorite", color: "text-blue-400" },
  "critic": { icon: faComment, label: "Critic", color: "text-green-400" },
  "innovator": { icon: faLightbulb, label: "Innovator", color: "text-purple-400" },
  "seasonal": { icon: faCalendarAlt, label: "Seasonal", color: "text-pink-400" }
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
      case "likes": return user.totalLikes.toLocaleString();
      case "submissions": return user.totalSubmissions.toLocaleString();
      case "streaks": return `${user.currentStreak} days`;
      default: return "";
    }
  };

  const rankIcon = getRankIcon(rank);

  return (
    <div className={`bg-gradient-to-r ${rank <= 3 ? 'from-pink-900/80 to-purple-900/80 border-2 border-pink-500' : 'from-pink-900/40 to-purple-900/40 border border-pink-600/50'} rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl`}>
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-800/60">
          {rankIcon ? (
            <FontAwesomeIcon icon={rankIcon.icon} className={`text-2xl ${rankIcon.color} drop-shadow-lg`} />
          ) : (
            <span className="text-xl font-bold text-pink-200">#{rank}</span>
          )}
        </div>

        {/* Profile Picture */}
        <div className="relative">
          <img
            src={user.profilePic}
            alt={user.displayName}
            className="w-16 h-16 rounded-full border-3 border-pink-500 object-cover"
          />
          {user.isPro && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCrown} className="text-xs text-white" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            {user.displayName}
            {user.isPro && <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full font-semibold">PRO</span>}
          </h3>
          <p className="text-pink-300 text-lg font-semibold">
            {getCategoryValue(user, category)}
          </p>
          
          {/* Achievements */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {user.achievements.slice(0, 4).map((achievement, i) => {
              const achData = achievementData[achievement];
              return achData ? (
                <div key={i} className="relative group">
                  <FontAwesomeIcon
                    icon={achData.icon}
                    className={`text-sm ${achData.color} hover:scale-125 transition-transform cursor-help`}
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {achData.label}
                  </div>
                </div>
              ) : null;
            })}
            {user.achievements.length > 4 && (
              <span className="text-xs text-pink-400 font-semibold">+{user.achievements.length - 4}</span>
            )}
          </div>
        </div>

        {/* Category Icon */}
        <div className="text-pink-400 text-2xl opacity-60">
          <FontAwesomeIcon 
            icon={category === "likes" ? faHeart : category === "submissions" ? faImage : faFire} 
          />
        </div>
      </div>
    </div>
  );
};

export default function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState("likes");

  const getSortedUsers = (category) => {
    const sorted = [...mockUsers].sort((a, b) => {
      switch (category) {
        case "likes": return b.totalLikes - a.totalLikes;
        case "submissions": return b.totalSubmissions - a.totalSubmissions;
        case "streaks": return b.currentStreak - a.currentStreak;
        default: return 0;
      }
    });
    return sorted;
  };

  const sortedUsers = getSortedUsers(activeCategory);

  const categories = [
    { key: "likes", label: "Total Likes", icon: faHeart },
    { key: "submissions", label: "Submissions", icon: faImage },
    { key: "streaks", label: "Current Streak", icon: faFire }
  ];

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
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key)}
            className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              activeCategory === category.key
                ? "bg-gradient-to-r from-pink-600 to-purple-700 text-white shadow-lg scale-105"
                : "bg-pink-900/40 text-pink-300 hover:bg-pink-800/60 hover:text-white border border-pink-600/50"
            }`}
          >
            <FontAwesomeIcon icon={category.icon} />
            {category.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {sortedUsers.slice(0, 3).map((user, index) => {
          const rank = index + 1;
          const podiumHeight = rank === 1 ? "h-32" : rank === 2 ? "h-24" : "h-20";
          const podiumColors = {
            1: "from-yellow-500/20 to-yellow-600/20 border-yellow-400",
            2: "from-gray-400/20 to-gray-500/20 border-gray-300",
            3: "from-orange-500/20 to-orange-600/20 border-orange-400"
          };
          
          return (
            <div key={user.uid} className={`text-center ${rank === 2 ? 'md:order-first' : rank === 1 ? 'md:order-2' : 'md:order-3'}`}>
              {/* User Avatar and Info */}
              <div className="mb-4">
                <div className="relative inline-block">
                  <img
                    src={user.profilePic}
                    alt={user.displayName}
                    className="w-20 h-20 rounded-full border-4 border-pink-500 object-cover mx-auto"
                  />
                  {user.isPro && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faCrown} className="text-sm text-white" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mt-2">{user.displayName}</h3>
                <p className="text-pink-300 font-semibold">
                  {activeCategory === "likes" && `${user.totalLikes.toLocaleString()} likes`}
                  {activeCategory === "submissions" && `${user.totalSubmissions} submissions`}
                  {activeCategory === "streaks" && `${user.currentStreak} day streak`}
                </p>
              </div>
              
              {/* Podium */}
              <div className={`${podiumHeight} bg-gradient-to-t ${podiumColors[rank]} border-2 rounded-t-lg flex items-end justify-center pb-4`}>
                <div className="text-center">
                  <FontAwesomeIcon 
                    icon={rank === 1 ? faTrophy : faMedal} 
                    className={`text-3xl mb-2 ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : 'text-orange-400'}`} 
                  />
                  <div className="text-2xl font-bold text-white">#{rank}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-pink-300 mb-6">Full Rankings</h2>
        {sortedUsers.map((user, index) => (
          <LeaderboardCard
            key={user.uid}
            user={user}
            rank={index + 1}
            category={activeCategory}
          />
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-pink-900/60 rounded-2xl p-6">
          <FontAwesomeIcon icon={faHeart} className="text-3xl text-pink-400 mb-2" />
          <h3 className="text-xl font-bold text-white">Total Likes</h3>
          <p className="text-2xl font-bold text-pink-300">
            {mockUsers.reduce((sum, user) => sum + user.totalLikes, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-pink-900/60 rounded-2xl p-6">
          <FontAwesomeIcon icon={faImage} className="text-3xl text-purple-400 mb-2" />
          <h3 className="text-xl font-bold text-white">Total Submissions</h3>
          <p className="text-2xl font-bold text-purple-300">
            {mockUsers.reduce((sum, user) => sum + user.totalSubmissions, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-pink-900/60 rounded-2xl p-6">
          <FontAwesomeIcon icon={faFire} className="text-3xl text-orange-400 mb-2" />
          <h3 className="text-xl font-bold text-white">Longest Streak</h3>
          <p className="text-2xl font-bold text-orange-300">
            {Math.max(...mockUsers.map(user => user.currentStreak))} days
          </p>
        </div>
      </div>
    </main>
  );
}
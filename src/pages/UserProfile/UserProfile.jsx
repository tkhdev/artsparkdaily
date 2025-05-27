import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faSave,
  faTimes,
  faFire,
  faStar,
  faThumbsUp,
  faMedal,
  faUpload,
  faCrown,
  faImage,
  faHeart,
  faCalendar,
  faTrophy
} from "@fortawesome/free-solid-svg-icons";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useAuth } from "../../context/AuthContext";
import { useOwnUserProfile } from "../../hooks/useOwnUserProfile";
import toast, { Toaster } from "react-hot-toast";

// Firebase imports
import { 
  storage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  db,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "../../firebase-config";

export default function UserProfile() {
  const { uid: paramUid } = useParams();
  const { user } = useAuth();
  const viewingOwnProfile = !paramUid || paramUid === user?.uid;
  const targetUid = paramUid || user?.uid;

  const { updateProfile } = useOwnUserProfile(targetUid);
  const { profile } = useUserProfile(targetUid);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  
  // State for real data
  const [achievements, setAchievements] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
      setProfilePic(profile.profilePic || "https://i.pravatar.cc/150?img=1");
      setUploadPreview(null);
      setUploadFile(null);
      setIsEditing(false);
    }
  }, [profile, targetUid]);

  // Fetch achievements and submissions
  useEffect(() => {
    if (targetUid) {
      fetchUserData();
    }
  }, [targetUid]);

  const calculateStreak = (submissions) => {
    if (!submissions || submissions.length === 0) return 0;

    // Get all submission dates and sort them by date (most recent first)
    const submissionDates = submissions
      .map(sub => sub.createdAt?.toDate ? sub.createdAt.toDate() : null)
      .filter(date => date !== null)
      .sort((a, b) => b - a);

    if (submissionDates.length === 0) return 0;

    // Helper function to get date string in YYYY-MM-DD format
    const getDateString = (date) => {
      return date.toISOString().split('T')[0];
    };

    // Get today's date string
    const today = new Date();
    const todayString = getDateString(today);
    
    // Get yesterday's date string
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = getDateString(yesterday);

    // Group submissions by date to handle multiple submissions per day
    const uniqueDates = [...new Set(submissionDates.map(date => getDateString(date)))];
    uniqueDates.sort((a, b) => new Date(b) - new Date(a)); // Sort most recent first

    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    const mostRecentSubmissionDate = uniqueDates[0];

    // Check if the streak should start counting
    // Streak is valid if the most recent submission was today or yesterday
    if (mostRecentSubmissionDate !== todayString && mostRecentSubmissionDate !== yesterdayString) {
      return 0; // Streak is broken if no submission today or yesterday
    }

    // Start calculating the streak
    let currentDate = new Date(today);
    
    // If most recent submission was yesterday, start from yesterday
    if (mostRecentSubmissionDate === yesterdayString) {
      currentDate = new Date(yesterday);
    }

    // Count consecutive days with submissions
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDateString = getDateString(currentDate);
      
      if (uniqueDates[i] === expectedDateString) {
        streak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Gap found, streak ends
        break;
      }
    }

    return streak;
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch achievements from users/{userId}/achievements subcollection
      const achievementsRef = collection(db, 'users', targetUid, 'achievements');
      const achievementsSnapshot = await getDocs(achievementsRef);
      const userAchievements = achievementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Map achievements to display format with icons and colors
      const mappedAchievements = userAchievements.map(achievement => ({
        icon: getAchievementIcon(achievement.id),
        label: achievement.name,
        value: achievement.description,
        color: getAchievementColor(achievement.id),
        bgGradient: getAchievementBgGradient(achievement.id),
        borderColor: getAchievementBorderColor(achievement.id),
        unlockedAt: achievement.unlockedAt
      }));

      setAchievements(mappedAchievements);

      // Fetch ALL user submissions for streak calculation (not limited)
      const allSubmissionsRef = collection(db, 'submissions');
      const allSubmissionsQuery = query(
        allSubmissionsRef,
        where('userId', '==', targetUid),
        orderBy('createdAt', 'desc')
      );
      
      const allSubmissionsSnapshot = await getDocs(allSubmissionsQuery);
      const allUserSubmissions = allSubmissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate streak using all submissions
      const calculatedStreak = calculateStreak(allUserSubmissions);
      setStreak(calculatedStreak);

      // Set limited submissions for display (latest 12)
      const displaySubmissions = allUserSubmissions.slice(0, 12);
      setSubmissions(displaySubmissions);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for achievement styling
  const getAchievementIcon = (achievementId) => {
    const iconMap = {
      'first_spark': faFire,
      'weekly_streak': faFire,
      'daily_streak': faFire,
      'top_submission': faStar,
      'total_likes': faThumbsUp,
      'challenges_won': faMedal,
      'featured_artist': faCrown,
      'prolific_creator': faImage,
      'community_favorite': faHeart
    };
    return iconMap[achievementId] || faTrophy;
  };

  const getAchievementColor = (achievementId) => {
    const colorMap = {
      'first_spark': 'text-orange-400',
      'weekly_streak': 'text-orange-400',
      'daily_streak': 'text-orange-400',
      'top_submission': 'text-yellow-400',
      'total_likes': 'text-blue-400',
      'challenges_won': 'text-purple-400',
      'featured_artist': 'text-pink-400',
      'prolific_creator': 'text-green-400',
      'community_favorite': 'text-red-400'
    };
    return colorMap[achievementId] || 'text-gray-400';
  };

  const getAchievementBgGradient = (achievementId) => {
    const gradientMap = {
      'first_spark': 'from-orange-500/20 to-red-500/20',
      'weekly_streak': 'from-orange-500/20 to-red-500/20',
      'daily_streak': 'from-orange-500/20 to-red-500/20',
      'top_submission': 'from-yellow-500/20 to-amber-500/20',
      'total_likes': 'from-blue-500/20 to-cyan-500/20',
      'challenges_won': 'from-purple-500/20 to-pink-500/20',
      'featured_artist': 'from-pink-500/20 to-rose-500/20',
      'prolific_creator': 'from-green-500/20 to-emerald-500/20',
      'community_favorite': 'from-red-500/20 to-pink-500/20'
    };
    return gradientMap[achievementId] || 'from-gray-500/20 to-slate-500/20';
  };

  const getAchievementBorderColor = (achievementId) => {
    const borderMap = {
      'first_spark': 'border-orange-400/50',
      'weekly_streak': 'border-orange-400/50',
      'daily_streak': 'border-orange-400/50',
      'top_submission': 'border-yellow-400/50',
      'total_likes': 'border-blue-400/50',
      'challenges_won': 'border-purple-400/50',
      'featured_artist': 'border-pink-400/50',
      'prolific_creator': 'border-green-400/50',
      'community_favorite': 'border-red-400/50'
    };
    return borderMap[achievementId] || 'border-gray-400/50';
  };

  const stats = {
    submissions: profile?.totalSubmissions || 0,
    likes: profile?.totalLikes || 0,
    streak: streak // Now using the calculated streak
  };

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (must be image)
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      e.target.value = null; // reset input
      return;
    }

    // Validate file size (max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast.error("File size should be less than 5 MB.");
      e.target.value = null;
      return;
    }

    setUploadPreview(URL.createObjectURL(file));
    setUploadFile(file);
  }

  function toggleEdit() {
    setIsEditing(!isEditing);
  }

  function cancelEdit() {
    setUploadPreview(null);
    setUploadFile(null);
    setIsEditing(false);
  }

  async function saveChanges() {
    try {
      let profilePicUrl = profilePic;

      if (uploadFile) {
        // Delete previous image from Storage if it is not the default avatar URL
        if (
          profilePic &&
          !profilePic.includes("pravatar.cc") && // default avatar URL check
          profilePic.startsWith("https://firebasestorage.googleapis.com")
        ) {
          try {
            // Extract file path from URL
            const startIndex = profilePic.indexOf("/o/") + 3; // after /o/
            const endIndex = profilePic.indexOf("?", startIndex);
            const filePath = decodeURIComponent(profilePic.substring(startIndex, endIndex));

            const oldRef = ref(storage, filePath);
            await deleteObject(oldRef);
            console.log("Old profile picture deleted from storage.");
          } catch (delError) {
            console.warn("Failed to delete old profile picture:", delError);
          }
        }

        // Upload new file to Firebase Storage
        const storageRef = ref(storage, `profile-pictures/${targetUid}/${uploadFile.name}`);
        await uploadBytes(storageRef, uploadFile);
        profilePicUrl = await getDownloadURL(storageRef);
      }

      // Save displayName, bio, and profilePic URL
      await updateProfile({ displayName, bio, profilePic: profilePicUrl });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setUploadFile(null);
      setUploadPreview(null);
      setProfilePic(profilePicUrl);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to save profile. Please try again.");
    }
  }

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 rounded-3xl shadow-2xl text-gray-100 my-8 select-none">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-400 mx-auto mb-4"></div>
            <p className="text-pink-300 text-xl">Loading profile...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 rounded-3xl shadow-2xl text-gray-100 my-8 select-none">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Hero Profile Section */}
      <section className="bg-gradient-to-r from-pink-900/80 to-purple-900/80 rounded-3xl p-8 mb-12 border-2 border-pink-500/50 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
          {/* Profile Picture Section */}
          <div className="relative group">
            <div className="relative w-56 h-56 rounded-3xl overflow-hidden border-4 border-pink-500 shadow-2xl hover:scale-105 transition-all duration-500 bg-gradient-to-br from-pink-600/20 to-purple-600/20">
              <img
                src={uploadPreview || profilePic}
                alt="Profile"
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
              {/* Pro Badge */}
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-purple-900 shadow-lg">
                <FontAwesomeIcon icon={faCrown} className="text-white text-lg" />
              </div>
              {/* Upload Overlay */}
              {isEditing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <label
                    htmlFor="profile-upload"
                    className="bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white font-bold px-6 py-3 rounded-full cursor-pointer shadow-lg select-none flex items-center gap-3 transform hover:scale-105 transition-all duration-200"
                  >
                    <FontAwesomeIcon icon={faUpload} />
                    Upload New
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              )}
            </div>
            {/* Status Indicator */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Online
              </div>
            </div>
          </div>

          {/* User Info Section */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            {!isEditing ? (
              <>
                <div className="space-y-4">
                  <h1 className="text-6xl font-extrabold drop-shadow-2xl">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-pulse">
                      {displayName}
                    </span>
                  </h1>
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-pink-300">
                    <FontAwesomeIcon icon={faCalendar} className="text-lg" />
                    <span className="text-lg font-semibold">
                      Member since {profile?.createdAt?.toDate ? 
                        new Date(profile.createdAt.toDate()).getFullYear() : 
                        '2024'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="bg-pink-900/40 rounded-2xl p-6 border border-pink-500/30 backdrop-blur-sm">
                  <h3 className="text-pink-300 font-bold text-lg mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                    About Me
                  </h3>
                  <p className="text-lg text-white leading-relaxed whitespace-pre-line min-h-[4rem] font-medium">
                    {bio || "No bio available. Add something about yourself to let others know who you are!"}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-pink-600/30 to-purple-600/30 rounded-xl p-4 border border-pink-400/30 text-center">
                    <FontAwesomeIcon icon={faImage} className="text-2xl text-pink-400 mb-2" />
                    <div className="text-2xl font-bold text-white">{stats.submissions}</div>
                    <div className="text-pink-300 text-sm font-semibold">Submissions</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-600/30 to-pink-600/30 rounded-xl p-4 border border-red-400/30 text-center">
                    <FontAwesomeIcon icon={faHeart} className="text-2xl text-red-400 mb-2" />
                    <div className="text-2xl font-bold text-white">{stats.likes}</div>
                    <div className="text-red-300 text-sm font-semibold">Total Likes</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-600/30 to-yellow-600/30 rounded-xl p-4 border border-orange-400/30 text-center">
                    <FontAwesomeIcon icon={faFire} className="text-2xl text-orange-400 mb-2" />
                    <div className="text-2xl font-bold text-white">{stats.streak}</div>
                    <div className="text-orange-300 text-sm font-semibold">Day Streak</div>
                  </div>
                </div>

                {viewingOwnProfile && (
                  <button
                    onClick={toggleEdit}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 active:scale-95 transition-all duration-300 rounded-2xl px-8 py-4 font-bold shadow-2xl text-white select-none text-lg hover:shadow-pink-500/25"
                  >
                    <FontAwesomeIcon icon={faPen} className="text-xl" />
                    Edit Profile
                  </button>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <input
                  type="text"
                  maxLength={100}
                  className="w-full rounded-2xl bg-gradient-to-r from-pink-900/60 to-purple-900/60 border-2 border-pink-500/50 text-white text-4xl font-bold px-8 py-6 placeholder-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-pink-400 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Your Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <textarea
                  maxLength={1000}
                  className="w-full rounded-2xl bg-gradient-to-r from-pink-900/60 to-purple-900/60 border-2 border-pink-500/50 text-pink-100 text-lg px-8 py-6 resize-y placeholder-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-500/50 focus:border-pink-400 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Tell everyone about yourself, your art, your inspirations..."
                  rows={5}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <div className="flex gap-6 justify-center lg:justify-start">
                  <button
                    onClick={saveChanges}
                    className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all duration-300 rounded-2xl px-8 py-4 font-bold text-white shadow-2xl select-none text-lg hover:shadow-green-500/25"
                  >
                    <FontAwesomeIcon icon={faSave} />
                    Save Changes
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 active:scale-95 transition-all duration-300 rounded-2xl px-8 py-4 font-bold text-white shadow-2xl select-none text-lg"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              Achievements
            </span>
          </h2>
          <p className="text-pink-300 text-lg">Milestones and accomplishments earned</p>
        </div>
        
        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achieve, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${achieve.bgGradient} rounded-2xl p-6 shadow-2xl hover:scale-105 transition-all duration-300 border-2 ${achieve.borderColor} relative overflow-hidden group`}
              >
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-black/20 to-black/40 mb-4 ${achieve.color} text-3xl shadow-lg`}>
                    <FontAwesomeIcon icon={achieve.icon} />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2 drop-shadow-lg">
                    {achieve.label}
                  </h3>
                  <p className={`${achieve.color} font-bold text-sm drop-shadow-lg mb-2`}>
                    {achieve.value}
                  </p>
                  {achieve.unlockedAt && (
                    <p className="text-gray-300 text-xs">
                      Unlocked {new Date(achieve.unlockedAt.toDate()).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                {/* Achievement Badge */}
                <div className="absolute top-3 right-3">
                  <FontAwesomeIcon icon={faTrophy} className="text-yellow-400/30 text-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faTrophy} className="text-6xl text-gray-500 mb-4" />
            <p className="text-gray-400 text-xl">No achievements yet</p>
            <p className="text-gray-500">Start creating to unlock your first achievement!</p>
          </div>
        )}
      </section>

      {/* Submissions Gallery */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              Art Gallery
            </span>
          </h2>
          <p className="text-pink-300 text-lg">Latest creative submissions and masterpieces</p>
        </div>
        
        {submissions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="group relative rounded-3xl overflow-hidden shadow-2xl border-2 border-pink-500/30 hover:border-pink-400/60 transition-all duration-500 bg-gradient-to-br from-pink-900/20 to-purple-900/20 hover:scale-105"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={sub.imageUrl}
                    alt={sub.prompt}
                    className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback to original URL if Firebase Storage URL fails
                      e.target.src = sub.originalImageUrl;
                    }}
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                </div>
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="space-y-3">
                    <h3 className="text-white font-bold text-xl drop-shadow-lg group-hover:text-pink-300 transition-colors duration-300 line-clamp-2">
                      {sub.prompt || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-pink-600/80 rounded-full px-4 py-2 backdrop-blur-sm">
                        <FontAwesomeIcon icon={faHeart} className="text-pink-200" />
                        <span className="text-white font-semibold">{sub.likesCount || 0}</span>
                      </div>
                      {sub.featured && (
                        <div className="bg-purple-600/80 rounded-full px-4 py-2 backdrop-blur-sm">
                          <span className="text-white font-semibold text-sm">Featured</span>
                        </div>
                      )}
                      <div className="bg-blue-600/80 rounded-full px-4 py-2 backdrop-blur-sm">
                        <span className="text-white font-semibold text-sm">
                          {new Date(sub.createdAt.toDate()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-pink-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faImage} className="text-6xl text-gray-500 mb-4" />
            <p className="text-gray-400 text-xl">No submissions yet</p>
            <p className="text-gray-500">Start creating art to build your gallery!</p>
          </div>
        )}
      </section>
    </main>
  );
}
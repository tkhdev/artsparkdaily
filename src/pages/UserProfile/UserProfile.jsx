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

// Firebase storage imports (added deleteObject)
import { storage, ref, uploadBytes, getDownloadURL, deleteObject } from "../../firebase-config";

const achievements = [
  { icon: faFire, label: "Daily Streak", value: "8 days", color: "text-orange-400", bgGradient: "from-orange-500/20 to-red-500/20", borderColor: "border-orange-400/50" },
  { icon: faStar, label: "Top Submission", value: "256 likes", color: "text-yellow-400", bgGradient: "from-yellow-500/20 to-amber-500/20", borderColor: "border-yellow-400/50" },
  { icon: faThumbsUp, label: "Total Likes", value: "1,024", color: "text-blue-400", bgGradient: "from-blue-500/20 to-cyan-500/20", borderColor: "border-blue-400/50" },
  { icon: faMedal, label: "Challenges Won", value: "3", color: "text-purple-400", bgGradient: "from-purple-500/20 to-pink-500/20", borderColor: "border-purple-400/50" }
];

const submissions = [
  {
    id: 1,
    title: "Neon Jungle",
    img: "https://picsum.photos/id/1043/200/200",
    likes: 256
  },
  {
    id: 2,
    title: "Cyber Fox",
    img: "https://picsum.photos/id/1043/200/200",
    likes: 198
  },
  {
    id: 3,
    title: "Pastel Samurai",
    img: "https://picsum.photos/id/1043/200/200",
    likes: 142
  }
];

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

  const stats = {
    submissions: submissions.length,
    likes: submissions.reduce((acc, cur) => acc + cur.likes, 0),
    streak: 8
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
                    <span className="text-lg font-semibold">Member since 2024</span>
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
                <p className={`${achieve.color} font-bold text-xl drop-shadow-lg`}>
                  {achieve.value}
                </p>
              </div>
              
              {/* Achievement Badge */}
              <div className="absolute top-3 right-3">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-400/30 text-lg" />
              </div>
            </div>
          ))}
        </div>
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="group relative rounded-3xl overflow-hidden shadow-2xl border-2 border-pink-500/30 hover:border-pink-400/60 transition-all duration-500 bg-gradient-to-br from-pink-900/20 to-purple-900/20 hover:scale-105"
            >
              <div className="relative overflow-hidden">
                <img
                  src={sub.img}
                  alt={sub.title}
                  className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="space-y-3">
                  <h3 className="text-white font-bold text-xl drop-shadow-lg group-hover:text-pink-300 transition-colors duration-300">
                    {sub.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-pink-600/80 rounded-full px-4 py-2 backdrop-blur-sm">
                      <FontAwesomeIcon icon={faHeart} className="text-pink-200" />
                      <span className="text-white font-semibold">{sub.likes}</span>
                    </div>
                    <div className="bg-purple-600/80 rounded-full px-4 py-2 backdrop-blur-sm">
                      <span className="text-white font-semibold text-sm">Featured</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-pink-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
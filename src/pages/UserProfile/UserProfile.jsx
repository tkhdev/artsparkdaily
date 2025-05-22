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
  faUserCircle
} from "@fortawesome/free-solid-svg-icons";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useAuth } from "../../context/AuthContext";
import { useOwnUserProfile } from "../../hooks/useOwnUserProfile";

const achievements = [
  {
    id: 1,
    title: "7-Day Streak",
    desc: "Completed daily challenge 7 days in a row",
    icon: faFire,
    unlocked: true
  },
  {
    id: 2,
    title: "Top Liked Artist",
    desc: "100+ likes on your submissions",
    icon: faThumbsUp,
    unlocked: true
  },
  {
    id: 3,
    title: "First Submission",
    desc: "Shared your first AI art creation",
    icon: faUserCircle,
    unlocked: true
  },
  {
    id: 4,
    title: "Legendary Creator",
    desc: "Featured on the leaderboard top 10",
    icon: faStar,
    unlocked: false
  }
];

const submissions = [
  {
    id: 1,
    title: "Mystic Forest",
    img: "https://picsum.photos/id/1040/200/200",
    likes: 45
  },
  {
    id: 2,
    title: "Neon Lights",
    img: "https://picsum.photos/id/1041/200/200",
    likes: 32
  },
  {
    id: 3,
    title: "Sunset Blaze",
    img: "https://picsum.photos/id/1042/200/200",
    likes: 51
  },
  {
    id: 4,
    title: "Cyber City",
    img: "https://picsum.photos/id/1043/200/200",
    likes: 60
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

  useEffect(() => {
  if (profile) {
    setDisplayName(profile.displayName || "");
    setBio(profile.bio || "");
    setProfilePic(profile.profilePic || "https://i.pravatar.cc/150?img=1");
    setUploadPreview(null); // Clear preview on user switch
    setIsEditing(false); // Exit edit mode when user/profile changes
  }
}, [profile, targetUid]);

  const stats = {
    submissions: submissions.length,
    likes: submissions.reduce((acc, cur) => acc + cur.likes, 0),
    streak: 8
  };

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setUploadPreview(URL.createObjectURL(file));
      // TODO: upload to Firebase Storage
    }
  }

  function toggleEdit() {
    setIsEditing(!isEditing);
  }

  function cancelEdit() {
    setUploadPreview(null);
    setIsEditing(false);
  }

  async function saveChanges() {
    try {
      await updateProfile({
        displayName,
        bio
        // profilePic should be handled after uploading to Firebase Storage
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 rounded-3xl shadow-2xl text-gray-100 select-none my-8">
      {/* PROFILE HEADER */}
      <section className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
        <div className="relative w-48 h-48 rounded-full overflow-hidden border-8 border-pink-600 shadow-xl hover:scale-105 transition-transform duration-300">
          <img
            src={uploadPreview || profilePic}
            alt="Profile"
            className="object-cover w-full h-full"
          />
          {isEditing && (
            <>
              <label
                htmlFor="profile-upload"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-5 py-2 rounded-full cursor-pointer shadow-lg select-none flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faUpload} />
                Upload
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </>
          )}
        </div>

        <div className="flex-1 space-y-6 select-text">
          {!isEditing ? (
            <>
              <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 drop-shadow-lg">
                {displayName}
              </h1>
              <p className="text-lg text-pink-300 leading-relaxed whitespace-pre-line min-h-[5rem]">
                {bio || "No bio available. Add something about yourself!"}
              </p>
              {viewingOwnProfile && (
                <button
                  onClick={toggleEdit}
                  aria-label="Edit Profile"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 active:scale-95 transition-transform duration-200 rounded-full px-8 py-3 font-semibold shadow-lg text-white select-none"
                >
                  <FontAwesomeIcon icon={faPen} />
                  Edit Profile
                </button>
              )}
            </>
          ) : (
            <>
              <input
                type="text"
                className="w-full rounded-xl bg-pink-900/60 border border-pink-600 text-white text-3xl font-bold px-6 py-4 placeholder-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-600 transition"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
              />
              <textarea
                className="w-full rounded-xl bg-pink-900/60 border border-pink-600 text-pink-100 text-lg px-6 py-4 resize-y placeholder-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-600 transition"
                placeholder="Write something about yourself..."
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={180}
              />
              <div className="flex gap-6 mt-6 justify-start">
                <button
                  onClick={saveChanges}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-95 transition-transform duration-200 rounded-full px-8 py-3 font-bold text-white shadow-lg select-none"
                >
                  <FontAwesomeIcon icon={faSave} />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-pink-400 hover:text-pink-600 font-semibold px-5 py-3 rounded-lg select-none"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* USER STATISTICS */}
      <section className="mt-20 bg-pink-900/30 rounded-3xl p-10 shadow-inner backdrop-blur-sm select-text">
        <h2 className="text-4xl font-bold text-pink-300 mb-10">Stats</h2>
        <div className="flex justify-center gap-20 max-w-4xl mx-auto text-center">
          {/* Submissions */}
          <div className="space-y-2">
            <FontAwesomeIcon
              icon={faMedal}
              size="4x"
              className="text-pink-400 drop-shadow-lg"
            />
            <p className="text-5xl font-extrabold text-white">
              {stats.submissions}
            </p>
            <p className="uppercase text-pink-300 tracking-widest font-semibold text-sm">
              Submissions
            </p>
          </div>

          {/* Likes */}
          <div className="space-y-2">
            <FontAwesomeIcon
              icon={faThumbsUp}
              size="4x"
              className="text-pink-400 drop-shadow-lg"
            />
            <p className="text-5xl font-extrabold text-white">{stats.likes}</p>
            <p className="uppercase text-pink-300 tracking-widest font-semibold text-sm">
              Likes Received
            </p>
          </div>

          {/* Streak */}
          <div className="space-y-2">
            <FontAwesomeIcon
              icon={faFire}
              size="4x"
              className="text-pink-400 drop-shadow-lg"
            />
            <p className="text-5xl font-extrabold text-white">{stats.streak}</p>
            <p className="uppercase text-pink-300 tracking-widest font-semibold text-sm">
              Current Streak
            </p>
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="mt-20">
        <h2 className="text-4xl font-bold text-pink-300 mb-10 select-text">
          Achievements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {achievements.map(({ id, title, desc, icon, unlocked }) => (
            <div
              key={id}
              className={`p-8 rounded-3xl shadow-lg cursor-default select-text transition-transform duration-300
                ${
                  unlocked
                    ? "bg-gradient-to-br from-pink-600 to-purple-700 hover:scale-[1.08] shadow-pink-500"
                    : "bg-pink-900 opacity-50 cursor-not-allowed"
                }`}
              title={unlocked ? desc : "Achievement locked"}
            >
              <FontAwesomeIcon
                icon={icon}
                size="4x"
                className={`mb-6 drop-shadow-lg ${
                  unlocked ? "text-yellow-400" : "text-pink-700"
                }`}
              />
              <h3
                className={`text-2xl font-semibold ${
                  unlocked ? "text-white" : "text-pink-400"
                }`}
              >
                {title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* SUBMISSIONS GALLERY */}
      <section className="mt-20">
        <h2 className="text-4xl font-bold text-pink-300 mb-10 select-text">
          Submissions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {submissions.map(({ id, title, img, likes }) => (
            <div
              key={id}
              className="rounded-3xl overflow-hidden shadow-xl bg-pink-900 hover:scale-[1.07] transition-transform duration-300 cursor-pointer"
              title={`${title} - ${likes} likes`}
            >
              <img
                src={img}
                alt={title}
                loading="lazy"
                className="w-full h-48 object-cover"
              />
              <div className="p-5 flex justify-between items-center text-pink-300 font-semibold text-lg">
                <span className="truncate">{title}</span>
                <span className="flex items-center gap-2 text-yellow-400">
                  <FontAwesomeIcon icon={faThumbsUp} />
                  {likes}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

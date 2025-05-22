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
  faUpload
} from "@fortawesome/free-solid-svg-icons";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useAuth } from "../../context/AuthContext";
import { useOwnUserProfile } from "../../hooks/useOwnUserProfile";
import toast, { Toaster } from "react-hot-toast";

// Firebase storage imports (added deleteObject)
import { storage, ref, uploadBytes, getDownloadURL, deleteObject } from "../../firebase-config";

const achievements = [
  { icon: faFire, label: "Daily Streak", value: "8 days" },
  { icon: faStar, label: "Top Submission", value: "256 likes" },
  { icon: faThumbsUp, label: "Total Likes", value: "1,024" },
  { icon: faMedal, label: "Challenges Won", value: "3" }
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
              <h1 className="text-5xl font-extrabold drop-shadow-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  {displayName}
                </span>
              </h1>
              <p className="text-lg text-pink-300 leading-relaxed whitespace-pre-line min-h-[5rem]">
                {bio || "No bio available. Add something about yourself!"}
              </p>
              {viewingOwnProfile && (
                <button
                  onClick={toggleEdit}
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
                maxLength={100}
                className="w-full rounded-xl bg-pink-900/60 border border-pink-600 text-white text-3xl font-bold px-6 py-4 placeholder-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-600 transition"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <textarea
                maxLength={1000}
                className="w-full rounded-xl bg-pink-900/60 border border-pink-600 text-pink-100 text-lg px-6 py-4 resize-y placeholder-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-600 transition"
                placeholder="Write something about yourself..."
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
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

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 text-center">
        {achievements.map((achieve, i) => (
          <div
            key={i}
            className="bg-pink-900 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform relative border-2 border-pink-500"
          >
            <FontAwesomeIcon
              icon={achieve.icon}
              className="text-pink-200 text-3xl mb-3 drop-shadow-[0_0_6px_rgba(255,192,203,0.8)]"
            />
            <h3 className="font-bold text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.7)]">
              {achieve.label}
            </h3>
            <p className="text-white font-semibold text-lg drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">
              {achieve.value}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-bold text-pink-300 mb-6">Submissions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="relative group rounded-2xl overflow-hidden shadow-xl"
            >
              <img
                src={sub.img}
                alt={sub.title}
                className="w-full h-64 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white font-bold text-lg">{sub.title}</h3>
                <p className="text-pink-300 text-sm">{sub.likes} likes</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

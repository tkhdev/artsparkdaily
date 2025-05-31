import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../../firebase-config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHeart,
  faComment,
  faCalendarAlt,
  faUser,
  faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/LoadingState";

export default function SubmissionDetail() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [challengeTitle, setChallengeTitle] = useState("Untitled Challenge");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const functions = getFunctions();
  const toggleSubmissionLike = httpsCallable(functions, "toggleSubmissionLike");
  const addSubmissionComment = httpsCallable(functions, "addSubmissionComment");

  // Like states
  const [userLikes, setUserLikes] = useState(false);
  const [likeCounts, setLikeCounts] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [animatingLikes, setAnimatingLikes] = useState(false);

  // Comment states
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [submissionComments, setSubmissionComments] = useState([]);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const docRef = doc(db, "submissions", submissionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const submissionData = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            likesCount: data.likes?.length || 0,
            commentsCount: data.comments?.length || 0,
          };
          setSubmission(submissionData);
          setLikeCounts(submissionData.likesCount);
          setUserLikes(user ? data.likes?.includes(user.uid) || false : false);
          setSubmissionComments(data.comments || []);

          // Fetch challenge data
          if (data.challengeId) {
            const challengeRef = doc(db, "dailyChallenges", data.challengeId);
            const challengeSnap = await getDoc(challengeRef);
            if (challengeSnap.exists()) {
              setChallengeTitle(challengeSnap.data().title || "Untitled Challenge");
            } else {
              console.warn("Challenge not found for ID:", data.challengeId);
            }
          }
        } else {
          setError("Submission not found.");
        }
      } catch (err) {
        console.error("Error fetching submission or challenge:", err);
        setError("Failed to load submission.");
      } finally {
        setLoading(false);
      }
    }

    fetchSubmission();
  }, [submissionId, user]);

  const handleToggleLike = async () => {
    if (!user) {
      alert("Please sign in to like submissions.");
      return;
    }

    // Optimistically update UI
    setUserLikes((prev) => {
      const liked = !prev;
      if (liked) {
        setAnimatingLikes(true);
        setTimeout(() => setAnimatingLikes(false), 300);
      }
      return liked;
    });

    setLikeCounts((prev) => (userLikes ? Math.max(prev - 1, 0) : (prev || 0) + 1));
    setLikeLoading(true);

    try {
      const result = await toggleSubmissionLike({ submissionId });
      const { liked } = result.data;

      // Sync local state with server response
      setUserLikes(liked);
      setLikeCounts((prev) => (
        liked
          ? prev >= 0 ? prev : 0
          : Math.max((prev || 1) - 1, 0)
      ));
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to toggle like. Please try again.");

      // Revert optimistic UI changes
      setUserLikes((prev) => !prev);
      setLikeCounts((prev) => (
        userLikes
          ? Math.max((prev || 1) - 1, 0)
          : (prev || 0) + 1
      ));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentChange = (value) => {
    setNewComment(value);
  };

  const handleSubmitComment = async () => {
    if (!user) {
      alert("Please sign in to comment.");
      return;
    }

    const commentText = newComment?.trim();
    if (!commentText) return;

    if (commentText.length > 500) {
      alert("Comment is too long. Please keep it under 500 characters.");
      return;
    }

    setCommentLoading(true);

    try {
      const result = await addSubmissionComment({
        submissionId,
        text: commentText
      });

      if (result.data.success) {
        const newCommentData = result.data.comment;
        setSubmissionComments((prev) => [...prev, newCommentData]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const formatCommentDate = (timestamp) => {
    if (!timestamp) return "";

    let date;
    if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8">
          <LoadingState message="Loading submission..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Page Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Submission Details</h1>
              <p className="text-gray-300">View and interact with this AI-generated artwork</p>
            </div>
            <nav className="text-sm text-gray-400">
              <span>Home</span>
              <span className="mx-2">/</span>
              <span className="text-purple-300">Submission</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl shadow-2xl border border-white/10 mb-8">
            <div className="px-6 py-8 sm:p-10">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                  <img
                    src={submission.imageUrl}
                    alt={submission.prompt}
                    className="rounded-xl shadow-xl w-full object-cover border border-white/10"
                  />
                </div>

                <div className="md:w-1/2 flex flex-col gap-4">
                  <h2 className="text-3xl font-bold text-white">{challengeTitle}</h2>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FontAwesomeIcon icon={faUser} />
                    <span>{submission.userDisplayName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex justify-between text-gray-300 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleToggleLike}
                        disabled={likeLoading}
                        className="focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                        aria-label={userLikes ? "Unlike submission" : "Like submission"}
                      >
                        <FontAwesomeIcon
                          icon={userLikes ? faHeart : faHeartOutline}
                          className={`transition-colors ${userLikes ? "text-red-400" : "text-gray-300"} ${animatingLikes ? "animate-like-pop" : ""}`}
                          style={{ fontSize: "1.25rem" }}
                        />
                      </button>
                      <span>{likeCounts ?? 0}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faComment} />
                      <span>{submissionComments.length}</span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="border-t border-white/10 pt-3 space-y-3">
                    {/* Existing Comments */}
                    {submissionComments.length > 0 ? (
                      <div className="space-y-2 pr-2">
                        {submissionComments.map((comment, index) => (
                          <div key={index} className="flex gap-2 text-sm">
                            <img
                              src={comment.userPhotoURL || "/default-avatar.png"}
                              alt={comment.userDisplayName}
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="font-semibold text-purple-300 text-xs">
                                  {comment.userDisplayName}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  {formatCommentDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm break-words">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-2">
                        No comments yet. Be the first to comment!
                      </p>
                    )}

                    {/* Comment Input */}
                    {user ? (
                      <div className="flex gap-2 pt-2 border-t border-white/10">
                        <img
                          src={user.photoURL || "/default-avatar.png"}
                          alt={user.displayName}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1"
                        />
                        <div className="flex-1 flex gap-2">
                          <textarea
                            value={newComment}
                            onChange={(e) => handleCommentChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Add a comment..."
                            className="flex-1 bg-black/20 text-gray-300 text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-purple-400 focus:outline-none resize-none"
                            rows="2"
                            maxLength="500"
                            disabled={commentLoading}
                            aria-label="Add a comment"
                          />
                          <button
                            onClick={handleSubmitComment}
                            disabled={commentLoading || !newComment?.trim()}
                            className="w-10 h-10 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer flex items-center justify-center"
                            aria-label="Submit comment"
                          >
                            <FontAwesomeIcon
                              icon={faPaperPlane}
                              className={commentLoading ? "animate-pulse" : ""}
                            />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-2">
                        <Link to="/login" className="underline hover:text-purple-300 cursor-pointer" aria-label="Sign in to comment">
                          Sign in
                        </Link>{" "}
                        to leave a comment
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
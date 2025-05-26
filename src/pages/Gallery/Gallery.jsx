import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faEye,
  faPaperPlane,
  faChevronDown,
  faChevronUp,
  faCrown,
  faTrophy,
  faFilter,
  faSort,
  faCalendarAlt,
  faImage,
  faStar
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { useGalleryData } from "../../hooks/useGalleryData";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, query, getDocs, getFirestore } from "firebase/firestore";
import "./Gallery.css";
import { useAuthActions } from "../../hooks/useAuthActions";

export default function Gallery() {
  const {
    challenges,
    selectedChallengeId,
    setSelectedChallengeId,
    sortBy,
    setSortBy,
    submissions,
    loading,
    error,
    hasMore,
    loadMore
  } = useGalleryData();

  const { user } = useAuth();
  const functions = getFunctions();
  const { loginWithGoogle } = useAuthActions();
  const db = getFirestore();
  const toggleSubmissionLike = httpsCallable(functions, "toggleSubmissionLike");
  const addSubmissionComment = httpsCallable(functions, "addSubmissionComment");

  // Track user likes per submission
  const [userLikes, setUserLikes] = useState({});
  // Track like counts separately to update UI immediately
  const [likeCounts, setLikeCounts] = useState({});
  // Track loading state per submission
  const [likeLoading, setLikeLoading] = useState({});
  // Track which submission is currently animating like
  const [animatingLikes, setAnimatingLikes] = useState({});

  // Comments state
  const [expandedComments, setExpandedComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [submissionComments, setSubmissionComments] = useState({});

  // Reference to comments containers for scrolling
  const commentsRefs = useRef({});

  // Winner tracking state
  const [winners, setWinners] = useState({});
  const [winnersLoading, setWinnersLoading] = useState(true);

  // Fetch daily winners
  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setWinnersLoading(true);
        const winnersRef = collection(db, "dailyWinners");
        const winnersQuery = query(winnersRef);
        const winnersSnapshot = await getDocs(winnersQuery);

        const winnersData = {};
        winnersSnapshot.forEach((doc) => {
          const winnerData = doc.data();
          winnersData[winnerData.submissionId] = {
            ...winnerData,
            date: doc.id
          };
        });

        setWinners(winnersData);
      } catch (error) {
        console.error("Error fetching winners:", error);
      } finally {
        setWinnersLoading(false);
      }
    };

    fetchWinners();
  }, [db]);

  // Initialize userLikes, likeCounts, and comments from submissions & user
  useEffect(() => {
    const updatedLikes = {};
    const updatedCounts = {};
    const updatedComments = {};

    submissions.forEach((submission) => {
      updatedCounts[submission.id] = submission.likesCount || 0;
      updatedLikes[submission.id] = user
        ? submission.likes?.includes(user.uid) || false
        : false;
      updatedComments[submission.id] = submission.comments || [];
    });

    setUserLikes(updatedLikes);
    setLikeCounts(updatedCounts);
    setSubmissionComments(updatedComments);
  }, [submissions, user]);

  // Helper function to check if a submission is a winner
  const isWinner = (submissionId) => {
    return winners[submissionId] !== undefined;
  };

  // Helper function to get winner data
  const getWinnerData = (submissionId) => {
    return winners[submissionId];
  };

  // Helper function to check if a challenge is completed
  const isChallengeCompleted = (challengeId) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return false;

    const challengeDate = new Date(challenge.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    challengeDate.setHours(0, 0, 0, 0);

    return challengeDate < today;
  };

  const handleToggleLike = async (submissionId) => {
    if (!user) {
      alert("Please sign in to like submissions.");
      return;
    }

    setUserLikes((prev) => {
      const liked = !prev[submissionId];
      if (liked) {
        setAnimatingLikes((anim) => ({ ...anim, [submissionId]: true }));
        setTimeout(() => {
          setAnimatingLikes((anim) => ({ ...anim, [submissionId]: false }));
        }, 300);
      }
      return { ...prev, [submissionId]: liked };
    });

    setLikeCounts((prev) => {
      const liked = !userLikes[submissionId];
      return {
        ...prev,
        [submissionId]: liked
          ? (prev[submissionId] || 0) + 1
          : Math.max((prev[submissionId] || 1) - 1, 0)
      };
    });

    setLikeLoading((prev) => ({ ...prev, [submissionId]: true }));

    try {
      const result = await toggleSubmissionLike({ submissionId });
      const { liked } = result.data;

      setUserLikes((prev) => ({ ...prev, [submissionId]: liked }));
      setLikeCounts((prev) => ({
        ...prev,
        [submissionId]: liked
          ? prev[submissionId] >= 0
            ? prev[submissionId]
            : 0
          : Math.max((prev[submissionId] || 1) - 1, 0)
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to toggle like. Please try again.");

      setUserLikes((prev) => ({
        ...prev,
        [submissionId]: !prev[submissionId]
      }));
      setLikeCounts((prev) => ({
        ...prev,
        [submissionId]: userLikes[submissionId]
          ? Math.max((prev[submissionId] || 1) - 1, 0)
          : (prev[submissionId] || 0) + 1
      }));
    } finally {
      setLikeLoading((prev) => ({ ...prev, [submissionId]: false }));
    }
  };

  const handleToggleComments = (submissionId) => {
    setExpandedComments((prev) => {
      const isExpanding = !prev[submissionId];
      if (isExpanding) {
        // Scroll to bottom when expanding
        setTimeout(() => {
          const commentsContainer = commentsRefs.current[submissionId];
          if (commentsContainer) {
            commentsContainer.scrollTo({
              top: commentsContainer.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 0); // Delay to ensure DOM is updated
      }
      return {
        ...prev,
        [submissionId]: !prev[submissionId]
      };
    });
  };

  const handleCommentChange = (submissionId, value) => {
    setNewComments((prev) => ({
      ...prev,
      [submissionId]: value
    }));
  };

  const handleSubmitComment = async (submissionId) => {
    if (!user) {
      alert("Please sign in to comment.");
      return;
    }

    const commentText = newComments[submissionId]?.trim();
    if (!commentText) return;

    if (commentText.length > 500) {
      alert("Comment is too long. Please keep it under 500 characters.");
      return;
    }

    setCommentLoading((prev) => ({ ...prev, [submissionId]: true }));

    try {
      const result = await addSubmissionComment({
        submissionId,
        text: commentText
      });

      if (result.data.success) {
        const newComment = result.data.comment;
        setSubmissionComments((prev) => ({
          ...prev,
          [submissionId]: [...(prev[submissionId] || []), newComment]
        }));

        // Clear the input
        setNewComments((prev) => ({
          ...prev,
          [submissionId]: ""
        }));

        // Scroll to bottom of comments
        const commentsContainer = commentsRefs.current[submissionId];
        if (commentsContainer) {
          commentsContainer.scrollTo({
            top: commentsContainer.scrollHeight,
            behavior: 'smooth'
          });
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setCommentLoading((prev) => ({ ...prev, [submissionId]: false }));
    }
  };

  const handleKeyPress = (e, submissionId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment(submissionId);
    }
  };

  const formatCommentDate = (timestamp) => {
    if (!timestamp) return "";

    let date;
    if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else if (timestamp.toDate && typeof timestamp.toDate === "function") {
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

  return (
    <main className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 rounded-3xl shadow-2xl text-gray-100 my-8 select-none">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Art Gallery
          </span>
        </h1>
        <p className="text-pink-300 text-lg">
          Discover amazing AI-generated artwork from our creative community
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faFilter} className="text-pink-400" />
            <label className="text-sm text-pink-300 font-semibold">
              Filter Challenges
            </label>
          </div>
          <select
            className="bg-gradient-to-r from-pink-900/60 to-purple-900/60 border border-pink-600/50 rounded-xl px-4 py-3 text-white font-semibold hover:bg-pink-800/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={selectedChallengeId}
            onChange={(e) => setSelectedChallengeId(e.target.value)}
          >
            {challenges.map((challenge) => (
              <option key={challenge.id} value={challenge.id} className="bg-purple-900">
                {challenge.title} - {challenge.date.toISOString().split("T")[0]}
                {isChallengeCompleted(challenge.id) ? " 👑" : ""}
              </option>
            ))}
            <option value="all" className="bg-purple-900">All Time</option>
          </select>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faSort} className="text-pink-400" />
            <label className="text-sm text-pink-300 font-semibold">
              Sort By
            </label>
          </div>
          <select
            className="bg-gradient-to-r from-pink-900/60 to-purple-900/60 border border-pink-600/50 rounded-xl px-4 py-3 text-white font-semibold hover:bg-pink-800/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt" className="bg-purple-900">Newest First</option>
            <option value="likesCount" className="bg-purple-900">Most Liked</option>
            <option value="commentsCount" className="bg-purple-900">Most Commented</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-4 mb-8 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Gallery Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {submissions.map((submission) => {
          const submissionIsWinner = isWinner(submission.id);
          const winnerData = getWinnerData(submission.id);
          const challengeCompleted = isChallengeCompleted(submission.challengeId);

          return (
            <article
              key={submission.id}
              className={`bg-gradient-to-br h-fit ${
                submissionIsWinner
                  ? 'from-yellow-900/60 to-orange-900/60 border-2 border-yellow-500 shadow-yellow-500/20'
                  : 'from-pink-900/60 to-purple-900/60 border border-pink-600/50'
              } rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-xl backdrop-blur-sm`}
            >
              {/* Winner Banner */}
              {submissionIsWinner && (
                <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black text-center py-3 px-4">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold">
                    <FontAwesomeIcon icon={faTrophy} />
                    <span>Daily Challenge Winner</span>
                    <FontAwesomeIcon icon={faTrophy} />
                  </div>
                  {winnerData && (
                    <p className="text-xs mt-1 opacity-90">
                      {winnerData.likesCount} likes • Won on{" "}
                      {new Date(winnerData.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* User Header */}
              <header className="flex items-center gap-3 p-4 pb-2">
                <div className="relative">
                  <img
                    src={submission.userPhotoURL}
                    alt={submission.userDisplayName}
                    className={`w-12 h-12 rounded-full object-cover border-2 ${
                      submissionIsWinner ? 'border-yellow-400' : 'border-pink-500'
                    }`}
                  />
                  {submissionIsWinner && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faCrown} className="text-black text-xs" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg truncate flex items-center gap-2">
                    <Link 
                      to={`/profile/${submission.userId}`} 
                      className="hover:text-pink-300 transition-colors"
                    >
                      {submission.userDisplayName}
                    </Link>
                    {submissionIsWinner && (
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
                    )}
                  </h3>
                  {challengeCompleted && !submissionIsWinner && (
                    <div className="flex items-center gap-1 text-pink-400 text-xs">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>Challenge Completed</span>
                    </div>
                  )}
                </div>
              </header>

              {/* Image */}
              <Link to={`/submission/${submission.id}`}>
                <div className="relative mx-4 mb-4 rounded-xl overflow-hidden group">
                  <img
                    src={submission.imageUrl}
                    alt={submission.prompt}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {submissionIsWinner && (
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 via-transparent to-transparent" />
                  )}
                </div>
              </Link>

              {/* Footer */}
              <footer className="p-4 pt-0">
                {/* Stats */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => handleToggleLike(submission.id)}
                    disabled={likeLoading[submission.id]}
                    className="flex items-center gap-2 hover:scale-110 transition-transform focus:outline-none group"
                    aria-label={
                      userLikes[submission.id] ? "Unlike submission" : "Like submission"
                    }
                  >
                    <FontAwesomeIcon
                      icon={userLikes[submission.id] ? faHeart : faHeartOutline}
                      className={`text-xl transition-colors ${
                        userLikes[submission.id]
                          ? "text-red-500"
                          : submissionIsWinner
                          ? "text-yellow-400 group-hover:text-red-400"
                          : "text-pink-400 group-hover:text-red-400"
                      } ${animatingLikes[submission.id] ? "animate-pulse" : ""}`}
                    />
                    <span className={`font-semibold ${
                      submissionIsWinner ? "text-yellow-300" : "text-pink-300"
                    }`}>
                      {likeCounts[submission.id] ?? 0}
                    </span>
                  </button>

                  <button
                    onClick={() => handleToggleComments(submission.id)}
                    className={`flex items-center gap-2 hover:scale-110 transition-all duration-300 focus:outline-none ${
                      submissionIsWinner
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-pink-400 hover:text-pink-300"
                    }`}
                  >
                    <FontAwesomeIcon icon={faComment} className="text-lg" />
                    <span className="font-semibold">
                      {(submissionComments[submission.id] || []).length}
                    </span>
                    <FontAwesomeIcon
                      icon={expandedComments[submission.id] ? faChevronUp : faChevronDown}
                      className="text-sm"
                    />
                  </button>

                  <div className={`flex items-center gap-2 text-sm ${
                    submissionIsWinner ? "text-yellow-400" : "text-pink-400"
                  }`}>
                    <FontAwesomeIcon icon={faEye} />
                    <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments[submission.id] && (
                  <div className={`border-t ${
                    submissionIsWinner ? 'border-yellow-600/50' : 'border-pink-600/50'
                  } pt-4 space-y-3`}>
                    {submissionComments[submission.id]?.length > 0 ? (
                      <div
                        ref={(el) => (commentsRefs.current[submission.id] = el)}
                        className="max-h-48 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-purple-900"
                      >
                        {submissionComments[submission.id].map((comment, index) => (
                          <div key={index} className="flex gap-3">
                            <img
                              src={comment.userPhotoURL || "/default-avatar.png"}
                              alt={comment.userDisplayName}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-pink-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-semibold text-pink-300 text-sm">
                                  {comment.userDisplayName}
                                </span>
                                <span className="text-pink-500 text-xs">
                                  {formatCommentDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-white text-sm break-words bg-pink-900/30 rounded-lg px-3 py-2">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <FontAwesomeIcon 
                          icon={faComment} 
                          className="text-3xl text-pink-500/50 mb-2" 
                        />
                        <p className="text-pink-400 text-sm">
                          No comments yet. Be the first to comment!
                        </p>
                      </div>
                    )}

                    {/* Comment Input */}
                    {user ? (
                      <div className={`flex gap-3 pt-3 border-t ${
                        submissionIsWinner ? 'border-yellow-600/30' : 'border-pink-600/30'
                      }`}>
                        <img
                          src={user.photoURL || "/default-avatar.png"}
                          alt={user.displayName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-pink-500"
                        />
                        <div className="flex-1 flex gap-2">
                          <textarea
                            value={newComments[submission.id] || ""}
                            onChange={(e) => handleCommentChange(submission.id, e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, submission.id)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-gradient-to-r from-purple-900/60 to-pink-900/60 text-white text-sm rounded-lg px-3 py-2 border border-pink-600/50 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none backdrop-blur-sm"
                            rows="2"
                            maxLength="500"
                            disabled={commentLoading[submission.id]}
                          />
                          <button
                            onClick={() => handleSubmitComment(submission.id)}
                            disabled={
                              commentLoading[submission.id] ||
                              !newComments[submission.id]?.trim()
                            }
                            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:scale-105"
                          >
                            <FontAwesomeIcon
                              icon={faPaperPlane}
                              className={commentLoading[submission.id] ? "animate-pulse" : ""}
                            />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-pink-900/30 rounded-lg">
                        <p className="text-pink-400 text-sm">
                          <button
                            onClick={loginWithGoogle}
                            className="text-pink-300 hover:text-white underline font-semibold transition-colors"
                          >
                            Sign in
                          </button>{" "}
                          to leave a comment
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </footer>
            </article>
          );
        })}
      </section>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-pink-300">
            <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-semibold">Loading amazing artwork...</span>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="flex items-center gap-3 mx-auto px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-700 text-white font-semibold rounded-2xl hover:from-pink-500 hover:to-purple-600 transition-all duration-300 shadow-xl hover:scale-105"
          >
            <FontAwesomeIcon icon={faImage} />
            <span>Load More Artwork</span>
          </button>
        </div>
      )}
    </main>
  );
}
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faEye,
  faPaperPlane,
  faChevronDown,
  faChevronUp,
  faCrown,
  faTrophy
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { useGalleryData } from "../../hooks/useGalleryData";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, query, getDocs, getFirestore } from "firebase/firestore";
import "./Gallery.css";

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
    <main className="max-w-7xl mx-auto p-8 rounded-3xl shadow-2xl bg-gradient-to-br from-purple-800 via-pink-800 to-purple-900 my-12">
      <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-extrabold drop-shadow-lg">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              Art Gallery
            </span>
          </h1>
        </div>

        <div className="flex gap-6 items-center text-pink-400 select-none">
          <div className="flex flex-col">
            <label className="text-sm text-pink-500 font-semibold mb-1">
              Filter
            </label>
            <select
              className="rounded-lg px-3 py-2 bg-purple-950 text-white border border-purple-700"
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
            >
              {challenges.map((challenge) => (
                <option key={challenge.id} value={challenge.id}>
                  {challenge.title} -{" "}
                  {challenge.date.toISOString().split("T")[0]}
                  {isChallengeCompleted(challenge.id) ? " 👑" : ""}
                </option>
              ))}
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-pink-500 font-semibold mb-1">
              Sort by
            </label>
            <select
              className="rounded-lg px-3 py-2 bg-purple-950 text-white border border-purple-700"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Newest</option>
              <option value="likesCount">Most Liked</option>
              <option value="commentsCount">Most Commented</option>
            </select>
          </div>
        </div>
      </header>

      {error && <p className="text-red-400 text-center mb-4">{error}</p>}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {submissions.map((submission) => {
          const submissionIsWinner = isWinner(submission.id);
          const winnerData = getWinnerData(submission.id);
          const challengeCompleted = isChallengeCompleted(
            submission.challengeId
          );

          return (
            <article
              key={submission.id}
              style={{ height: "fit-content" }}
              className={`bg-purple-900/80 backdrop-blur rounded-xl shadow-lg flex flex-col overflow-hidden relative ${
                submissionIsWinner
                  ? "ring-2 ring-yellow-400 shadow-yellow-400/20"
                  : ""
              }`}
            >
              {submissionIsWinner && (
                <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black text-center py-2 px-4">
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

              <header className="flex items-center gap-3 p-4 pb-2">
                <div className="relative">
                  <img
                    src={submission.userPhotoURL}
                    alt={submission.userDisplayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {submissionIsWinner && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faCrown}
                        className="text-black text-xs"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg truncate flex items-center gap-2">
                    {submission.userDisplayName}
                    {submissionIsWinner && (
                      <span className="text-yellow-400 text-sm">👑</span>
                    )}
                  </h3>
                  {challengeCompleted && !submissionIsWinner && (
                    <p className="text-pink-400 text-xs">Challenge Completed</p>
                  )}
                </div>
              </header>

              <Link to={`/submission/${submission.id}`}>
                <div className="relative">
                  <img
                    src={submission.imageUrl}
                    alt={submission.prompt}
                    className="rounded-md w-full max-h-64 object-cover hover:opacity-90 transition"
                    loading="lazy"
                  />
                  {submissionIsWinner && (
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 via-transparent to-transparent pointer-events-none" />
                  )}
                </div>
              </Link>

              <footer className="p-4 pt-3">
                <div className="flex justify-between text-pink-400 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleLike(submission.id)}
                      disabled={likeLoading[submission.id]}
                      className="focus:outline-none hover:scale-110 transition-transform"
                      aria-label={
                        userLikes[submission.id]
                          ? "Unlike submission"
                          : "Like submission"
                      }
                    >
                      <FontAwesomeIcon
                        icon={
                          userLikes[submission.id] ? faHeart : faHeartOutline
                        }
                        className={`transition-colors ${
                          userLikes[submission.id]
                            ? "text-red-500"
                            : submissionIsWinner
                            ? "text-yellow-400"
                            : "text-pink-400"
                        } ${
                          animatingLikes[submission.id]
                            ? "animate-like-pop"
                            : ""
                        }`}
                        style={{ fontSize: "1.25rem" }}
                      />
                    </button>
                    <span
                      className={
                        submissionIsWinner
                          ? "text-yellow-400 font-semibold"
                          : ""
                      }
                    >
                      {likeCounts[submission.id] ?? 0}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleComments(submission.id)}
                    className={`flex items-center gap-2 hover:text-pink-300 transition-colors focus:outline-none ${
                      submissionIsWinner
                        ? "text-yellow-400 hover:text-yellow-300"
                        : ""
                    }`}
                  >
                    <FontAwesomeIcon icon={faComment} />
                    <span>
                      {(submissionComments[submission.id] || []).length}
                    </span>
                    <FontAwesomeIcon
                      icon={
                        expandedComments[submission.id]
                          ? faChevronUp
                          : faChevronDown
                      }
                      className="text-xs"
                    />
                  </button>

                  <div className="flex items-center gap-2 text-pink-500">
                    <FontAwesomeIcon icon={faEye} />
                    <span>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {expandedComments[submission.id] && (
                  <div className="border-t border-purple-700 pt-3 space-y-3">
                    {submissionComments[submission.id]?.length > 0 ? (
                      <div
                        ref={(el) => (commentsRefs.current[submission.id] = el)}
                        className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-purple-900"
                      >
                        {submissionComments[submission.id].map(
                          (comment, index) => {
                            return (
                              <div key={index} className="flex gap-2 text-sm">
                                <img
                                  src={
                                    comment.userPhotoURL ||
                                    "/default-avatar.png"
                                  }
                                  alt={comment.userDisplayName}
                                  className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="font-semibold text-pink-300 text-xs">
                                      {comment.userDisplayName}
                                    </span>
                                    <span className="text-pink-500 text-xs">
                                      {formatCommentDate(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-white text-sm break-words">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <p className="text-pink-500 text-sm text-center py-2">
                        No comments yet. Be the first to comment!
                      </p>
                    )}

                    {user ? (
                      <div className="flex gap-2 pt-2 border-t border-purple-700/50">
                        <img
                          src={user.photoURL || "/default-avatar.png"}
                          alt={user.displayName}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1"
                        />
                        <div className="flex-1 flex gap-2">
                          <textarea
                            value={newComments[submission.id] || ""}
                            onChange={(e) =>
                              handleCommentChange(submission.id, e.target.value)
                            }
                            onKeyPress={(e) => handleKeyPress(e, submission.id)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-purple-800 text-white text-sm rounded-lg px-3 py-2 border border-purple-600 focus:border-pink-400 focus:outline-none resize-none"
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
                            className="px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          >
                            <FontAwesomeIcon
                              icon={faPaperPlane}
                              className={
                                commentLoading[submission.id]
                                  ? "animate-pulse"
                                  : ""
                              }
                            />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-pink-500 text-sm text-center py-2">
                        <a
                          href="/login"
                          className="underline hover:text-pink-400"
                        >
                          Sign in
                        </a>{" "}
                        to leave a comment
                      </p>
                    )}
                  </div>
                )}
              </footer>
            </article>
          );
        })}
      </section>

      {loading && <p className="text-center text-white mt-6">Loading...</p>}

      {!loading && hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-3 rounded-xl bg-pink-600 text-white hover:bg-pink-500 transition shadow-lg"
          >
            Load More
          </button>
        </div>
      )}
    </main>
  );
}
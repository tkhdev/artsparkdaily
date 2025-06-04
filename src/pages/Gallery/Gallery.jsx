import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faPaperPlane,
  faChevronDown,
  faChevronUp,
  faCrown,
  faTrophy,
  faFilter,
  faSort,
  faCalendarAlt,
  faImage,
  faShareAlt
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import {
  faTwitter,
  faFacebookF,
  faPinterestP,
  faRedditAlien,
  faTumblr
} from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import { useGalleryData } from "../../hooks/useGalleryData";
import { useAuth } from "../../context/AuthContext";
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, query, getDocs, getFirestore } from "firebase/firestore";
import { useAuthActions } from "../../hooks/useAuthActions";
import "./Gallery.css";

export default function Gallery() {
  // ===== Hooks and Context =====
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
  const { loginWithGoogle } = useAuthActions();
  const functions = getFunctions();
  const db = getFirestore();
  
  // ===== API Functions =====
  const toggleSubmissionLike = httpsCallable(functions, "toggleSubmissionLike");
  const addSubmissionComment = httpsCallable(functions, "addSubmissionComment");

  // ===== State Management =====
  const [userLikes, setUserLikes] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const [animatingLikes, setAnimatingLikes] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [submissionComments, setSubmissionComments] = useState({});
  const [winners, setWinners] = useState({});
  const [winnersLoading, setWinnersLoading] = useState(true);
  const [shareMenuOpen, setShareMenuOpen] = useState({});
  
  // ===== Refs =====
  const commentsRefs = useRef({});
  const shareMenuRefs = useRef({});
  const observerRef = useRef(null);
  
  // ===== Data Fetch & Setup =====
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

  // Update user likes and comments when submissions change
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

  // Handle outside clicks for share menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(shareMenuRefs.current).forEach((submissionId) => {
        if (
          shareMenuRefs.current[submissionId] &&
          !shareMenuRefs.current[submissionId].contains(event.target)
        ) {
          setShareMenuOpen((prev) => ({ ...prev, [submissionId]: false }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== Helper Functions =====
  const isWinner = (submissionId) => {
    return winners[submissionId] !== undefined;
  };

  const getWinnerData = (submissionId) => {
    return winners[submissionId];
  };

  const isChallengeCompleted = (challengeId) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return false;

    const challengeDate = new Date(challenge.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    challengeDate.setHours(0, 0, 0, 0);

    return challengeDate < today;
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
    if (isNaN(date.getTime())) return "";
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

  // ===== Event Handlers =====
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
        [submissionId]: result.data.newLikesCount !== undefined 
          ? result.data.newLikesCount 
          : prev[submissionId]
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to toggle like. Please try again.");

      // Revert optimistic updates
      setUserLikes((prev) => ({ ...prev, [submissionId]: !prev[submissionId] }));
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
        setTimeout(() => {
          const commentsContainer = commentsRefs.current[submissionId];
          if (commentsContainer) {
            commentsContainer.scrollTo({
              top: commentsContainer.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
      return { ...prev, [submissionId]: !prev[submissionId] };
    });
  };

  const handleCommentChange = (submissionId, value) => {
    setNewComments((prev) => ({ ...prev, [submissionId]: value }));
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
        setNewComments((prev) => ({ ...prev, [submissionId]: "" }));
        
        setTimeout(() => {
          const commentsContainer = commentsRefs.current[submissionId];
          if (commentsContainer) {
            commentsContainer.scrollTo({
              top: commentsContainer.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 100);
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

  const handleShare = (platform, submissionId, imageUrl, prompt) => {
    const shareText = `Check out this artwork from the gallery! "${prompt}"`;
    const submissionUrl = `${window.location.origin}/submission/${submissionId}`;
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(submissionUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(submissionUrl)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(submissionUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(shareText)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(submissionUrl)}&title=${encodeURIComponent(shareText)}`,
      tumblr: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(submissionUrl)}&caption=${encodeURIComponent(shareText)}&posttype=photo&content=${encodeURIComponent(imageUrl)}`
    };

    window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
    setShareMenuOpen((prev) => ({ ...prev, [submissionId]: false }));
  };

  const toggleShareMenu = (submissionId) => {
    setShareMenuOpen((prev) => ({
      ...prev,
      [submissionId]: !prev[submissionId]
    }));
  };

  // ===== Data Configuration =====
  const shareOptions = [
    { platform: "twitter", icon: faTwitter, label: "Twitter", action: handleShare },
    { platform: "facebook", icon: faFacebookF, label: "Facebook", action: handleShare },
    { platform: "pinterest", icon: faPinterestP, label: "Pinterest", action: handleShare },
    { platform: "reddit", icon: faRedditAlien, label: "Reddit", action: handleShare },
    { platform: "tumblr", icon: faTumblr, label: "Tumblr", action: handleShare }
  ];
  
  const sortOptionsList = [
    { value: "createdAt", label: "Newest", icon: faCalendarAlt },
    { value: "likesCount", label: "Most Liked", icon: faHeart },
    { value: "commentsCount", label: "Most Commented", icon: faComment }
  ];

  // ===== Render Component =====
  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 text-gray-100">
      {/* Header with title and description */}
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
            Creative Gallery
          </span>
        </h1>
        <p className="text-lg text-purple-300 max-w-2xl mx-auto">
          Discover stunning AI-generated artwork from our talented community of creators
        </p>
      </header>

      {/* Filters and Sort Options */}
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 mb-10 shadow-lg border border-purple-500/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Filter by Challenge */}
          <div className="w-full md:w-auto">
            <label className="flex items-center gap-2 text-sm text-purple-300 font-medium mb-2">
              <FontAwesomeIcon icon={faFilter} className="text-pink-400" />
              Filter by Challenge
            </label>
            <select
              className="w-full md:w-64 bg-gray-800/90 border border-purple-500/30 text-white rounded-xl px-4 py-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500/70 transition-all hover:bg-gray-700/80"
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%239333ea' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")", backgroundPosition: "right 0.75rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
            >
              {challenges.map((challenge) => (
                <option key={challenge.id} value={challenge.id} className="bg-gray-800">
                  {challenge.title} - {new Date(challenge.date).toLocaleDateString()}
                  {isChallengeCompleted(challenge.id) ? " 👑" : ""}
                </option>
              ))}
              <option value="all" className="bg-gray-800">All Time</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="w-full md:w-auto">
            <label className="flex items-center gap-2 text-sm text-purple-300 font-medium mb-2">
              <FontAwesomeIcon icon={faSort} className="text-pink-400" />
              Sort Submissions
            </label>
            <div className="flex flex-wrap gap-2">
              {sortOptionsList.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`action-button px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-sm
                    ${sortBy === option.value 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                      : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white border border-purple-500/30'
                    }`}
                >
                  <FontAwesomeIcon icon={option.icon} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-4 mb-8 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Submission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
        {submissions.map((submission) => {
          const submissionIsWinner = isWinner(submission.id);
          const winnerData = getWinnerData(submission.id);
          const challengeCompleted = isChallengeCompleted(submission.challengeId);
          const submissionChallenge = challenges.find(c => c.id === submission.challengeId);
          const hasComments = (submissionComments[submission.id] || []).length > 0;

          return (
            <article
              key={submission.id}
              className={`rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] shadow-xl ${
                submissionIsWinner
                  ? 'bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-2 border-yellow-500/70 shadow-yellow-500/10'
                  : 'bg-gradient-to-br from-gray-900/90 to-purple-900/80 border border-purple-500/30'
              }`}
            >
              {/* Winner Badge */}
              {submissionIsWinner && (
                <div className="winner-badge bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 text-black text-center py-2.5 px-4">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold">
                    <FontAwesomeIcon icon={faTrophy} className="text-yellow-900" />
                    <span>Daily Winner</span>
                    <FontAwesomeIcon icon={faTrophy} className="text-yellow-900" />
                  </div>
                  {winnerData && (
                    <div className="text-xs mt-0.5 opacity-90">
                      {winnerData.likesCount} likes • {new Date(winnerData.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}

              {/* User Info Header */}
              <div className="flex items-start gap-3 p-4">
                <Link 
                  to={`/profile/${submission.userId}`} 
                  className="relative flex-shrink-0 transition-transform hover:scale-105"
                >
                  <img
                    src={submission.userPhotoURL || "/default-avatar.png"}
                    alt={submission.userDisplayName}
                    className={`w-11 h-11 rounded-full object-cover border-2 ${
                      submissionIsWinner ? 'border-yellow-400' : 'border-pink-500'
                    }`}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg truncate">
                      <Link 
                        to={`/profile/${submission.userId}`} 
                        className="hover:text-pink-300 transition-colors"
                      >
                        {submission.userDisplayName}
                      </Link>
                    </h3>
                    <div className="text-xs text-purple-300">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Challenge info */}
                  {challengeCompleted && !submissionIsWinner && (
                    <div className="flex items-center gap-1 text-purple-400 text-xs">
                      <FontAwesomeIcon icon={faCalendarAlt} size="xs" />
                      <span>Challenge Completed</span>
                    </div>
                  )}
                  {selectedChallengeId === "all" && submissionChallenge && (
                    <p className="text-xs text-purple-300 truncate mt-0.5" title={`From challenge: ${submissionChallenge.title}`}>
                      From: {submissionChallenge.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Image */}
              <div className="relative mx-3 mb-3 rounded-xl overflow-hidden image-container">
                <Link to={`/submission/${submission.id}`}>
                  <img
                    src={submission.imageUrl}
                    alt={submission.prompt}
                    className="w-full h-60 object-cover image-hover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                
                {/* Share Button */}
                <div
                  className="absolute top-3 right-3 z-10"
                  ref={(el) => (shareMenuRefs.current[submission.id] = el)}
                >
                  <button
                    onClick={() => toggleShareMenu(submission.id)}
                    className="bg-black/50 backdrop-blur-sm w-9 h-9 flex items-center justify-center rounded-full hover:bg-purple-800/70 transition-colors"
                    title="Share"
                    aria-label="Share this artwork"
                  >
                    <FontAwesomeIcon icon={faShareAlt} className="text-white text-sm" />
                  </button>
                  
                  {/* Share Menu */}
                  {shareMenuOpen[submission.id] && (
                    <div className="absolute right-0 mt-2 w-44 bg-gray-900/95 backdrop-blur-md border border-purple-500/30 rounded-xl shadow-xl overflow-hidden z-20">
                      <div className="px-3 py-2 text-xs text-center text-purple-300 border-b border-purple-500/30">
                        Share to
                      </div>
                      {shareOptions.map((option) => (
                        <button
                          key={option.platform}
                          onClick={() => option.action(
                            option.platform,
                            submission.id,
                            submission.imageUrl,
                            submission.prompt
                          )}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-200 hover:bg-purple-700/30 transition-colors"
                        >
                          <FontAwesomeIcon icon={option.icon} className="mr-3 text-purple-400 w-4" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer with Like & Comment */}
              <div className="px-4 pb-4">
                <div className="flex justify-between items-center">
                  {/* Like Button */}
                  <button
                    onClick={() => handleToggleLike(submission.id)}
                    disabled={likeLoading[submission.id]}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-pink-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    aria-label={userLikes[submission.id] ? "Unlike submission" : "Like submission"}
                  >
                    <FontAwesomeIcon
                      icon={userLikes[submission.id] ? faHeart : faHeartOutline}
                      className={`text-lg ${
                        userLikes[submission.id]
                          ? "text-pink-500"
                          : "text-pink-400"
                      } ${animatingLikes[submission.id] ? "heart-pulse" : ""}`}
                    />
                    <span className="font-medium text-sm">
                      {likeCounts[submission.id] ?? 0}
                    </span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => handleToggleComments(submission.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-purple-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                    aria-label={expandedComments[submission.id] ? "Hide comments" : "Show comments"}
                  >
                    <FontAwesomeIcon icon={faComment} className="text-purple-400 text-lg" />
                    <span className="font-medium text-sm">
                      {(submissionComments[submission.id] || []).length}
                    </span>
                    <FontAwesomeIcon
                      icon={expandedComments[submission.id] ? faChevronUp : faChevronDown}
                      className="text-xs text-purple-400"
                    />
                  </button>
                </div>
                
                {/* Comments Section */}
                {expandedComments[submission.id] && (
                  <div className={`pt-3 mt-3 space-y-3 border-t ${
                    submissionIsWinner ? 'border-yellow-500/30' : 'border-purple-500/30'
                  } comments-container`}>
                    {hasComments ? (
                      <div
                        ref={(el) => (commentsRefs.current[submission.id] = el)}
                        className="max-h-48 overflow-y-auto space-y-3 pr-1 custom-scrollbar"
                      >
                        {submissionComments[submission.id].map((comment, index) => (
                          <div key={index} className="flex gap-2.5">
                            <img
                              src={comment.userPhotoURL || "/default-avatar.png"}
                              alt={comment.userDisplayName}
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-purple-500/50"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between mb-1">
                                <span className="font-medium text-purple-300 text-xs">
                                  {comment.userDisplayName}
                                </span>
                                <span className="text-purple-400 text-xs">
                                  {formatCommentDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-white text-sm break-words bg-purple-900/30 backdrop-blur-sm rounded-lg px-3 py-2">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <FontAwesomeIcon 
                          icon={faComment} 
                          className="text-2xl text-purple-500/40 mb-2" 
                        />
                        <p className="text-purple-300 text-sm">
                          No comments yet. Be the first!
                        </p>
                      </div>
                    )}

                    {/* Comment Form */}
                    {user ? (
                      <div className="flex gap-2 pt-3 border-t border-purple-500/20">
                        <img
                          src={user.photoURL || "/default-avatar.png"}
                          alt={user.displayName}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-purple-500/50"
                        />
                        <div className="flex-1 flex gap-2">
                          <textarea
                            value={newComments[submission.id] || ""}
                            onChange={(e) => handleCommentChange(submission.id, e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, submission.id)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-purple-900/20 backdrop-blur-sm text-white text-sm rounded-lg px-3 py-2 border border-purple-500/40 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-500/50 resize-none"
                            rows="1"
                            maxLength="500"
                            disabled={commentLoading[submission.id]}
                          />
                          <button
                            onClick={() => handleSubmitComment(submission.id)}
                            disabled={
                              commentLoading[submission.id] ||
                              !newComments[submission.id]?.trim()
                            }
                            className="px-3 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg"
                            aria-label="Submit comment"
                          >
                            <FontAwesomeIcon
                              icon={faPaperPlane}
                              className={commentLoading[submission.id] ? "animate-pulse" : ""}
                            />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 px-4 bg-purple-900/20 backdrop-blur-sm rounded-lg border border-purple-500/30">
                        <p className="text-purple-300 text-sm">
                          <button
                            onClick={loginWithGoogle}
                            className="text-pink-400 hover:text-white underline font-medium transition-colors"
                          >
                            Sign in
                          </button>{" "}
                          to leave a comment
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-pink-300">Loading amazing artwork...</span>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="action-button px-8 py-3.5 bg-gradient-to-r from-pink-600 to-purple-700 text-white font-medium rounded-xl hover:from-pink-500 hover:to-purple-600 transition-all shadow-lg flex items-center gap-3 mx-auto"
          >
            <FontAwesomeIcon icon={faImage} />
            <span>Load More Artwork</span>
          </button>
        </div>
      )}
    </main>
  );
}

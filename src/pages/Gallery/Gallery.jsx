import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faEye } from "@fortawesome/free-solid-svg-icons";
import { useGalleryData } from "../../hooks/useGalleryData";
import { Link } from "react-router-dom";

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
    loadMore,
  } = useGalleryData();

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
                  {challenge.title} - {challenge.date.toISOString().split("T")[0]}
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

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {submissions.map((submission) => (
          <article
            key={submission.id}
            className="bg-purple-900 p-4 rounded-xl shadow-lg flex flex-col gap-4"
          >
            <header className="flex items-center gap-3">
              <img
                src={submission.userPhotoURL}
                alt={submission.userDisplayName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <h3 className="text-white font-semibold text-lg truncate">
                {submission.userDisplayName}
              </h3>
            </header>

            <Link to={`/submission/${submission.id}`}>
              <img
                src={submission.imageUrl}
                alt={submission.prompt}
                className="rounded-md w-full max-h-64 object-cover hover:opacity-90 transition"
                loading="lazy"
              />
            </Link>

            <p
              className="text-pink-300 text-sm italic truncate"
              title={submission.prompt}
            >
              {submission.prompt}
            </p>

            <footer className="flex justify-between text-pink-400 text-sm mt-auto">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHeart} />
                {submission.likesCount}
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faComment} />
                {submission.commentsCount}
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEye} />
                {new Date(submission.createdAt).toLocaleDateString()}
              </div>
            </footer>
          </article>
        ))}
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

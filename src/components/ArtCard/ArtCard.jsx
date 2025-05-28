import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faTrophy, faStar } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import "./ArtCard.css";
import { Link } from "react-router-dom";

export default function ArtCard({
  likes,
  user,
  hoursAgo,
  description,
  userAvatar,
  imageSrc,
  isWinner = false, // Added prop to handle winner styling
  submissionId = null
}) {
  return (
    <article
      className={`bg-gradient-to-br h-fit ${
        isWinner
          ? "from-yellow-900/60 to-orange-900/60 border-2 border-yellow-500 shadow-yellow-500/20"
          : "from-pink-900/60 to-purple-900/60 border border-pink-600/50"
      } rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-xl backdrop-blur-sm flex flex-col`}
    >
      {/* Winner Banner */}
      {isWinner && (
        <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black text-center py-3 px-4">
          <div className="flex items-center justify-center gap-2 text-sm font-bold">
            <FontAwesomeIcon icon={faTrophy} />
            <span>Daily Challenge Winner</span>
            <FontAwesomeIcon icon={faTrophy} />
          </div>
          <p className="text-xs mt-1 opacity-90">
            {likes} likes • Won on {new Date().toLocaleDateString()}
          </p>
        </div>
      )}

      {/* User Header */}
      <header className="flex items-center gap-3 p-4 pb-2">
        <div className="relative">
          <img
            src={userAvatar}
            alt={`${user}'s avatar`}
            className={`w-12 h-12 rounded-full object-cover border-2 ${
              isWinner ? "border-yellow-400" : "border-pink-500"
            }`}
          />
          {isWinner && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faStar} className="text-black text-xs" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg truncate flex items-center gap-2">
            <span className="hover:text-pink-300 transition-colors">
              {user}
            </span>
            {isWinner && (
              <FontAwesomeIcon
                icon={faStar}
                className="text-yellow-400 text-sm"
              />
            )}
          </h3>
          <div className="flex items-center gap-1 text-pink-400 text-xs">
            <span>{hoursAgo} hours ago</span>
          </div>
        </div>
      </header>

      {/* Image */}
      <div className="relative mx-4 mb-4 rounded-xl overflow-hidden group">
        <Link to={`/submission/${submissionId}`}>
          <img
            src={imageSrc}
            alt={description}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {isWinner && (
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 via-transparent to-transparent" />
        )}
        <div className="absolute bottom-0 right-0 m-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full flex items-center text-sm font-medium shadow-inner">
          <FontAwesomeIcon
            icon={faHeart}
            className={isWinner ? "text-yellow-400 mr-1" : "text-red-500 mr-1"}
          />
          <span className={isWinner ? "text-yellow-300" : "text-pink-300"}>
            {likes}
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 pt-0">
        <p className="text-gray-100 text-sm line-clamp-2">{description}</p>
      </footer>
    </article>
  );
}

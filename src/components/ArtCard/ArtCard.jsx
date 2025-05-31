import "./ArtCard.css";
import { Link } from "react-router-dom";

export default function ArtCard({
  user,
  hoursAgo,
  description,
  userAvatar,
  imageSrc,
  submissionId = null
}) {
  return (
    <article
      className={`bg-gradient-to-br h-fit ${"from-pink-900/60 to-purple-900/60 border border-pink-600/50"} rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-xl backdrop-blur-sm flex flex-col`}
    >
      {/* User Header */}
      <header className="flex items-center gap-3 p-4 pb-2">
        <div className="relative">
          <img
            src={userAvatar}
            alt={`${user}'s avatar`}
            className={`w-12 h-12 rounded-full object-cover border-2 ${"border-pink-500"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg truncate flex items-center gap-2">
            <span className="hover:text-pink-300 transition-colors">
              {user}
            </span>
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
      </div>

      {/* Footer */}
      <footer className="p-4 pt-0">
        <p className="text-gray-100 text-sm line-clamp-2">{description}</p>
      </footer>
    </article>
  );
}

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import "./ArtCard.css"

export default function ArtCard({
  likes,
  user,
  hoursAgo,
  description,
  userAvatar,
  imageSrc
}) {
  return (
    <article className="art-card bg-purple-900/80 backdrop-blur rounded-xl shadow-lg overflow-hidden border border-purple-700/50 flex flex-col transition hover:shadow-purple-700/30">
      <div className="relative aspect-square w-full">
        <img
          src={imageSrc}
          alt="AI generated art"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 right-0 m-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full flex items-center text-pink-400 text-sm font-medium shadow-inner">
          <FontAwesomeIcon icon={faHeart} className="text-red-500 mr-1" />
          {likes}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <img
              src={userAvatar}
              alt={`${user}'s avatar`}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-purple-600"
            />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user}</p>
            <p className="text-xs text-pink-400 truncate">{hoursAgo} hours ago</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm line-clamp-2">{description}</p>
      </div>
    </article>
  );
}

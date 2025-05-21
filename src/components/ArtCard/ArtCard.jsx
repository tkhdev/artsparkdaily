import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import './ArtCard.css'

export default function ArtCard({
  likes,
  user,
  hoursAgo,
  description,
  userAvatar,
  imageSrc
}) {
  return (
    <div className="art-card rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="relative aspect-square">
        <img
          src={imageSrc}
          alt="AI generated art"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 right-0 bg-black/50 backdrop-blur-sm px-3 py-1 m-3 rounded-full flex items-center">
          <FontAwesomeIcon icon={faHeart} className="text-red-500 mr-1" />
          <span className="text-sm">{likes}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full overflow-hidden">
            <img
              src={userAvatar}
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium">{user}</p>
            <p className="text-xs text-gray-400">{hoursAgo} hours ago</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm line-clamp-2">{description}</p>
      </div>
    </div>
  );
}

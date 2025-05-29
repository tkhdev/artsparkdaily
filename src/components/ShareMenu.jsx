import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareAlt } from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faFacebookF,
  faPinterestP,
  faRedditAlien,
  faTumblr
} from "@fortawesome/free-brands-svg-icons";

const shareOptions = [
  { platform: "twitter", icon: faTwitter, label: "Twitter" },
  { platform: "facebook", icon: faFacebookF, label: "Facebook" },
  { platform: "pinterest", icon: faPinterestP, label: "Pinterest" },
  { platform: "reddit", icon: faRedditAlien, label: "Reddit" },
  { platform: "tumblr", icon: faTumblr, label: "Tumblr" }
];

const ShareMenu = ({ isOpen, onToggle, imageUrl, prompt, challengeTitle }) => {
  const menuRef = useRef(null);
  const [flipDirection, setFlipDirection] = useState("bottom");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const handleShare = (platform) => {
    const shareText = `Check out my artwork for today's challenge! "${challengeTitle}"`;
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(imageUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        imageUrl
      )}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
        imageUrl
      )}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(
        shareText
      )}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(
        imageUrl
      )}&title=${encodeURIComponent(shareText)}`,
      tumblr: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(
        imageUrl
      )}&caption=${encodeURIComponent(
        shareText
      )}&posttype=photo&content=${encodeURIComponent(imageUrl)}`
    };

    window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
    onToggle(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => onToggle(!isOpen)}
        className="bg-gray-800/80 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700/80"
      >
        <FontAwesomeIcon icon={faShareAlt} className="text-white text-xs" />
      </button>
      {isOpen && (
        <div
          className={`absolute z-50 bottom-right w-48 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl`}
        >
          {shareOptions.map((option) => (
            <button
              key={option.platform}
              onClick={() => handleShare(option.platform)}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-purple-500/20 transition-colors"
            >
              <FontAwesomeIcon icon={option.icon} className="mr-2 text-white" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShareMenu;

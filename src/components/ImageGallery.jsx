import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faUpload,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import GlowButton from "./GlowButton/GlowButton";
import ShareMenu from "./ShareMenu";

const normalizeDate = (timestamp) => {
  if (!timestamp) return 0;

  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000).getTime();
  } else if (timestamp.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate().getTime();
  } else {
    return new Date(timestamp).getTime();
  }
};

const ImageGallery = ({
  images,
  userSubmission,
  onSubmit,
  isSubmitting,
  challengeTitle
}) => {
  const [shareMenuOpen, setShareMenuOpen] = useState(null);

  const sortedImages = [...(images || [])].sort((a, b) => {
    if (a.id === userSubmission?.generatedImageId) return -1;
    if (b.id === userSubmission?.generatedImageId) return 1;

    return normalizeDate(b.createdAt) - normalizeDate(a.createdAt);
  });

  if (!sortedImages.length) return null;

  return (
    <div className="bg-black/20 rounded-xl p-6 border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-4">
        Your Generated Images
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedImages.map((image) => (
          <div
            key={image.id}
            className={`relative rounded-lg border-2 ${
              image.id === userSubmission?.generatedImageId
                ? "border-green-500"
                : "border-transparent"
            }`}
          >
            <img
              src={image.imageUrl}
              alt={image.prompt}
              className="w-full h-48 object-cover"
            />
            {image.id === userSubmission?.generatedImageId && (
              <div className="absolute top-2 left-2 bg-green-500/80 px-2 py-1 rounded-full text-xs text-white flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                Submitted
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
              <p className="text-gray-200 text-sm truncate">{image.prompt}</p>
              <div className="flex justify-between mt-1">
                {!userSubmission && (
                  <GlowButton
                    onClick={() => onSubmit(image)}
                    className="glow-button bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xs py-1 px-2 rounded"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin mr-1"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faUpload} className="mr-1" />
                        Submit
                      </>
                    )}
                  </GlowButton>
                )}
                <ShareMenu
                  isOpen={shareMenuOpen === image.id}
                  onToggle={() =>
                    setShareMenuOpen(
                      shareMenuOpen === image.id ? null : image.id
                    )
                  }
                  imageUrl={image.imageUrl}
                  prompt={image.prompt}
                  challengeTitle={challengeTitle}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;

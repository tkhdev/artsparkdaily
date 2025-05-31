import { useState, useCallback, useEffect } from "react"; // Added useEffect
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faUpload,
  faSpinner,
  faExpand,
  faTh,
  faList,
  faTimes
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
  const [viewMode, setViewMode] = useState("grid");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});

  // Reset loadedImages when images prop changes
  useEffect(() => {
    setLoadedImages({});
  }, [images]);

  const sortedImages = [...(images || [])].sort((a, b) => {
    if (a.id === userSubmission?.generatedImageId) return -1;
    if (b.id === userSubmission?.generatedImageId) return 1;
    return normalizeDate(b.createdAt) - normalizeDate(a.createdAt);
  });

  const handleImageLoad = useCallback((imageId) => {
    setLoadedImages((prev) => ({ ...prev, [imageId]: true }));
  }, []);

  const handleImageError = useCallback((imageId) => {
    setLoadedImages((prev) => ({ ...prev, [imageId]: true })); // Treat errors as loaded to clear spinner
  }, []);

  const formatDate = (timestamp) => {
    return new Date(normalizeDate(timestamp)).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });
  };

  if (!sortedImages.length) {
    return (
      <div className="bg-black/20 rounded-xl p-6 border border-white/10 text-white text-center">
        No images available yet.
      </div>
    );
  }

  return (
    <div className="bg-black/20 rounded-xl p-6 border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-white">
          Your Generated Images
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`w-10 h-10 flex items-center justify-center rounded cursor-pointer ${
              viewMode === "grid" ? "bg-white/20" : "bg-black/30"
            } hover:bg-white/30 transition-colors`}
            aria-label="Grid view"
          >
            <FontAwesomeIcon icon={faTh} className="text-white" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`w-10 h-10 flex items-center justify-center rounded cursor-pointer ${
              viewMode === "list" ? "bg-white/20" : "bg-black/30"
            } hover:bg-white/30 transition-colors`}
            aria-label="List view"
          >
            <FontAwesomeIcon icon={faList} className="text-white" />
          </button>
        </div>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-6"
        }
      >
        {sortedImages.map((image) => (
          <div
            key={image.id}
            className={`relative rounded-lg border-2 transition-all duration-300 hover:shadow-xl hover:shadow-white/10 ${
              image.id === userSubmission?.generatedImageId
                ? "border-green-500"
                : "border-transparent"
            } ${viewMode === "list" ? "flex flex-col sm:flex-row gap-4" : ""}`}
            role="article"
            aria-label={`Generated image: ${image.prompt}`}
          >
            <div
              className={`relative ${
                viewMode === "grid" ? "aspect-square" : "w-full sm:w-1/3"
              }`}
            >
              {!loadedImages[image.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="animate-spin text-white text-2xl"
                  />
                </div>
              )}
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className={`w-full ${
                  viewMode === "grid" ? "h-full" : "h-48"
                } object-cover rounded-lg cursor-pointer`}
                onClick={() => setSelectedImage(image)}
                onLoad={() => handleImageLoad(image.id)}
                onError={() => handleImageError(image.id)} // Added onError handler
                loading="lazy"
              />
              {image.id === userSubmission?.generatedImageId && (
                <div className="absolute top-2 left-2 bg-green-500/80 px-3 py-1 rounded-full text-sm text-white flex items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Submitted
                </div>
              )}
              <button
                onClick={() => setSelectedImage(image)}
                className="absolute top-2 right-2 bg-black/50 w-10 h-10 flex items-center justify-center rounded cursor-pointer hover:bg-black/70 transition-colors"
                aria-label="View full image"
              >
                <FontAwesomeIcon icon={faExpand} className="text-white" />
              </button>
            </div>

            <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
              <p className="text-gray-200 text-sm mb-2 line-clamp-2">
                {image.prompt}
              </p>
              <p className="text-gray-400 text-xs mb-3">
                Created: {formatDate(image.createdAt)}
              </p>
              <div className="flex justify-between items-center">
                {!userSubmission && (
                  <GlowButton
                    onClick={() => onSubmit(image)}
                    className="glow-button bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-sm py-2 px-4 rounded cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin mr-2"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faUpload} className="mr-2" />
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

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-label="Image lightbox"
        >
          <div
            className="relative max-w-4xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.prompt}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <button
              className="absolute top-4 right-4 bg-black/50 w-10 h-10 flex items-center justify-center rounded cursor-pointer hover:bg-black/70 transition-colors"
              onClick={() => setSelectedImage(null)}
              aria-label="Close lightbox"
            >
              <FontAwesomeIcon icon={faTimes} className="text-white" />
            </button>
            <div className="mt-4 text-white text-center">
              <p className="text-lg font-medium">{selectedImage.prompt}</p>
              <p className="text-sm text-gray-400">
                Created: {formatDate(selectedImage.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
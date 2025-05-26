import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ArtCard from "../ArtCard/ArtCard";
import { useFeaturedCreations } from "../../hooks/useFeaturedCreations";
import { Link } from "react-router-dom";

export default function FeaturedCreations() {
  const { creations, loading } = useFeaturedCreations(6);

  return (
    <section className="pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Featured Creations</h2>
        <Link
          to="/gallery"
          className="text-purple-400 hover:text-purple-300 flex items-center"
        >
          <span>View All</span>
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[300px] bg-gray-800 rounded-xl animate-pulse"
              />
            ))
          : creations.map((c, idx) => (
              <ArtCard
                key={idx}
                likes={c.likesCount}
                user={c.user}
                description={c.description}
                userAvatar={c.userAvatar}
                imageSrc={c.imageSrc}
                hoursAgo={Math.floor(
                  (Date.now() - c.createdAt.getTime()) / 3600000
                )}
              />
            ))}
      </div>
    </section>
  );
}

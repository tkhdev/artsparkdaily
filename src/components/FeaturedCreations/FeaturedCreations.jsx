import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ArtCard from "../ArtCard/ArtCard";

export default function FeaturedCreations() {
  const creations = [
    {
      likes: 147,
      user: "ArtisticMind",
      hoursAgo: 2,
      description:
        "Cosmic dreams dancing through the nebulae, where stars are born and wishes fly",
      userAvatar: "https://picsum.photos/200/200",
      imageSrc: "https://picsum.photos/200/200"
    },
    {
      likes: 92,
      user: "CosmicCreator",
      hoursAgo: 4,
      description:
        "Deep space slumbers where gravity pulls dreams into spiraling galaxies",
      userAvatar: "https://picsum.photos/200/200",
      imageSrc: "https://picsum.photos/200/200"
    },
    {
      likes: 204,
      user: "StarDreamer",
      hoursAgo: 6,
      description: "Ethereal cosmic jellyfish floating through the multiverse",
      userAvatar: "https://picsum.photos/200/200",
      imageSrc: "https://picsum.photos/200/200"
    }
  ];

  return (
    <section className="pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Featured Creations</h2>
        <a
          href="#"
          className="text-purple-400 hover:text-purple-300 flex items-center"
        >
          <span>View All</span>
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {creations.map((c, idx) => (
          <ArtCard key={idx} {...c} />
        ))}
      </div>
    </section>
  );
}

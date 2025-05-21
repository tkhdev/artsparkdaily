import React, { useState } from "react";
import GlowButton from "../../components/GlowButton/GlowButton";

export default function Gallery() {
  // Sample artwork data with categories
  const artworks = [
    {
      id: 1,
      title: "Sunset Dream",
      artist: "Artist1",
      imageUrl: "https://picsum.photos/200/200",
      category: "Nature"
    },
    {
      id: 2,
      title: "Mystic Forest",
      artist: "Artist2",
      imageUrl: "https://picsum.photos/200/200",
      category: "Nature"
    },
    {
      id: 3,
      title: "Urban Mirage",
      artist: "Artist3",
      imageUrl: "https://picsum.photos/200/200",
      category: "Urban"
    },
    {
      id: 4,
      title: "Cosmic Voyage",
      artist: "Artist4",
      imageUrl: "https://picsum.photos/200/200",
      category: "Space"
    }
    // Add additional artworks as needed
  ];

  // Filter state: category & search query
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Filter artworks by category and title/artist match
  const filteredArtworks = artworks.filter((art) => {
    const matchesCategory = filter === "All" || art.category === filter;
    const matchesSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.artist.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Categories for filtering
  const categories = ["All", "Nature", "Urban", "Space"];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center hero-gradient">
        Gallery
      </h1>
      <p className="text-lg text-gray-300 text-center mb-12">
        Explore a curated collection of AI-generated art entries from our
        community.
      </p>

      {/* Filter and Search Section */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Category Filter Buttons */}
        <div className="flex space-x-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full transition-colors duration-300 ${
                filter === cat
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Search Input */}
        <div>
          <input
            type="text"
            placeholder="Search artworks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/10 border border-white/10 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Artwork Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredArtworks.map((art) => (
          <div
            key={art.id}
            className="relative group art-card prompt-card rounded-lg overflow-hidden shadow-lg"
          >
            <img
              src={art.imageUrl}
              alt={art.title}
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <h3 className="text-xl font-bold text-white">{art.title}</h3>
              <p className="text-gray-300 text-sm">By {art.artist}</p>
              <GlowButton className="mt-2 glow-button bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full">
                View Details
              </GlowButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

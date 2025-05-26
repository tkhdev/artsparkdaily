// components/HeroSection/HeroSection.tsx
import CounterCard from "../CounterCard/CounterCard";
import { useHeroStats } from "../../hooks/useHeroStats";
import "./HeroSection.css";

export default function HeroSection() {
  const { stats, loading } = useHeroStats();

  return (
    <section className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 hero-gradient">
          Daily AI Art Challenge
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Create, share, and connect through AI-generated art with daily creative prompts
        </p>

        <div className="flex justify-center space-x-8 mt-12">
          <CounterCard
            count={loading ? "..." : stats.artists.toLocaleString()}
            label="Artists"
            colorClass="text-pink-400"
          />
          <CounterCard
            count={loading ? "..." : stats.creations.toLocaleString()}
            label="Creations"
            colorClass="text-purple-400"
          />
          <CounterCard
            count={loading ? "..." : stats.challenges.toLocaleString()}
            label="Challenges"
            colorClass="text-blue-400"
          />
        </div>
      </div>
    </section>
  );
}

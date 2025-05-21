import CounterCard from "../CounterCard/CounterCard";
import './HeroSection.css'

export default function HeroSection() {
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
          <CounterCard count="4,872" label="Artists" colorClass="text-pink-400" />
          <CounterCard count="14,320" label="Creations" colorClass="text-purple-400" />
          <CounterCard count="217" label="Challenges" colorClass="text-blue-400" />
        </div>
      </div>
    </section>
  );
}

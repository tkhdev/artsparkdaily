import HeroSection from "../../components/HeroSection/HeroSection";
import DailyChallengeCard from "../../components/DailyChallengeCard/DailyChallengeCard";
import FeaturedCreations from "../../components/FeaturedCreations/FeaturedCreations";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import JoinCommunity from "../../components/JoinCommunity/JoinCommunity";

function Home() {
  return (
    <>
      <HeroSection />
      <DailyChallengeCard />
      <FeaturedCreations />
      <HowItWorks />
      <JoinCommunity />
    </>
  );
}

export default Home;

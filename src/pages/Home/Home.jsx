import HeroSection from "../../components/HeroSection/HeroSection";
import DailyChallengeCard from "../../components/DailyChallengeCard/DailyChallengeCard";
import FeaturedCreations from "../../components/FeaturedCreations/FeaturedCreations";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import JoinCommunity from "../../components/JoinCommunity/JoinCommunity";
import { useAuth } from "../../context/AuthContext";

function Home() {
  const { user } = useAuth();
  return (
    <>
      <HeroSection />
      <DailyChallengeCard />
      <FeaturedCreations />
      <HowItWorks />
      {!user && <JoinCommunity />}
    </>
  );
}

export default Home;

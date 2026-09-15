import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import BrowseShortcuts from "../components/BrowseShortcuts";
import HeroSection from "../components/HeroSection";
import HiringSection from "../components/HiringSection";
import HowItWorksSection from "../components/HowItWorksSection";
import LatestJobsSection from "../components/LatestJobsSection";

const HomePage = () => {
  useDocumentTitle();

  return (
    <>
      <HeroSection />
      <LatestJobsSection />
      <BrowseShortcuts />
      <HowItWorksSection />
      <HiringSection />
    </>
  );
};

export default HomePage;

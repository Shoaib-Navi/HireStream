import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import BrowseShortcuts from "../components/BrowseShortcuts";
import EmployerCta from "../components/EmployerCta";
import HeroSection from "../components/HeroSection";
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
      <EmployerCta />
    </>
  );
};

export default HomePage;

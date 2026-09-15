import React, { useEffect } from "react";
import HeroSection from "./HeroSection";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import GridBackground from "../design/GridBackground";
import TrustedBySection from "./TrustedBySection";
import FeaturedJobs from "./FeaturedJobs";
import HowItWorks from "./HowItWorks";
import TestimonialsSection from "./TestimonialsSection";
import PageHero from "../shared/PageHero";

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  // Recruiters work from their dashboard
  useEffect(() => {
    if (user?.role === "recruiter") {
      navigate("/admin/companies", { replace: true });
    }
  }, [user, navigate]);

  return (
    <>
      <GridBackground variant="lines" fade="radial" color="slate">
        <HeroSection />
      </GridBackground>
      <TrustedBySection />
      <GridBackground variant="lines" fade="radial" color="slate">
        <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-6xl mx-auto">
          <PageHero
            image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400"
            title="Top Hiring Companies"
            subtitle="Explore companies actively hiring and find where you belong."
            btnText="Explore jobs"
            btnLink="/jobs"
            align="left"
          />
        </div>
      </GridBackground>

      <FeaturedJobs />
      <HowItWorks />
      <TestimonialsSection />
    </>
  );
};

export default Home;

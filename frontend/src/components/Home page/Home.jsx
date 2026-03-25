import React, { useEffect } from "react";
import Navbar from "../shared/Navbar";
// import HeroSection from '../HeroSection'
import HeroSection from "./HeroSection";
import CategoryCarousel from "../CategoryCarousel";
import LatestJobs from "../LatestJobs";
// import Footer from '../Footer'
import Footer from "../shared/Footer";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import store from "@/redux/store";
import GridBackground from "../design/GridBackground";
import TrustedBySection from "./TrustedBySection";
import CategorySection from "./CategorySection";
import FeaturedJobs from "./FeaturedJobs";
import HowItWorks from "./HowItWorks";
import TestimonialsSection from "./TestimonialsSection";
import PageHero from "../shared/PageHero";

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role == "recruiter") {
      navigate("/admin/companies");
    }
  }, []);

  return (
    <>
      <Navbar />
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
            btnText="View companies"
            btnLink="/companies"
            align="left"
          />
        </div>
      </GridBackground>

      {/* <CategorySection /> */}
      <FeaturedJobs />
      <HowItWorks />
      <TestimonialsSection />
      <Footer />
    </>
  );
};

export default Home;

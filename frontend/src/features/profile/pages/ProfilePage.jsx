import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/Spinner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useGetMyProfileQuery } from "../api";
import EducationSection from "../components/EducationSection";
import ExperienceSection from "../components/ExperienceSection";
import LinksForm from "../components/LinksForm";
import PreferencesForm from "../components/PreferencesForm";
import ProfileBasicsForm from "../components/ProfileBasicsForm";
import ProfileCompletion from "../components/ProfileCompletion";
import ResumeCard from "../components/ResumeCard";

const ProfilePage = () => {
  useDocumentTitle("Your profile");
  const { data: profile, isLoading, isError, error, refetch } = useGetMyProfileQuery();
  const { hash } = useLocation();

  // Links like /dashboard/profile#resume jump to that section once it has rendered
  useEffect(() => {
    if (profile && hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [profile, hash]);

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState title="Couldn't load your profile" error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Recruiters see this profile when you apply to their jobs." />
      <ProfileCompletion profile={profile} />
      <ProfileBasicsForm profile={profile} />
      <ResumeCard profile={profile} />
      <ExperienceSection profile={profile} />
      <EducationSection profile={profile} />
      <LinksForm profile={profile} />
      <PreferencesForm profile={profile} />
    </div>
  );
};

export default ProfilePage;

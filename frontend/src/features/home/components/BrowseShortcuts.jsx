import FeatureGrid from "@/components/common/FeatureGrid";
import SectionHeading from "@/components/common/SectionHeading";

const SHORTCUTS = [
  { title: "Remote jobs", description: "Work from anywhere in the country.", to: "/jobs?workMode=remote", cta: "Browse remote" },
  { title: "Hybrid roles", description: "Mix office days with days at home.", to: "/jobs?workMode=hybrid", cta: "Browse hybrid" },
  { title: "Internships", description: "Kick-start your career with real work.", to: "/jobs?employmentType=internship", cta: "Browse internships" },
  { title: "Part-time", description: "Flexible hours that fit around your life.", to: "/jobs?employmentType=part-time", cta: "Browse part-time" },
];

const BrowseShortcuts = () => (
  <section className="page-container pb-20 sm:pb-28">
    <SectionHeading eyebrow="Explore" title="Browse jobs your way" />
    <FeatureGrid items={SHORTCUTS} columns={4} className="mt-12" />
  </section>
);

export default BrowseShortcuts;

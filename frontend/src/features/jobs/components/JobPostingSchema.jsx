// schema.org JobPosting data, which lets search engines list the job in their job search (Google for Jobs).
// Only for open jobs posted through HireStream: seeded jobs mirror other employers' listings.

const LAKH = 100_000;

const EMPLOYMENT_TYPES = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
  freelance: "CONTRACTOR",
  internship: "INTERN",
};

const escapeHtml = (text) =>
  text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const htmlList = (heading, items) =>
  items?.length ? `<h3>${heading}</h3><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";

// The description field accepts basic HTML, so the whole post is kept together
const toDescriptionHtml = (job) =>
  job.description
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("") +
  htmlList("Responsibilities", job.responsibilities) +
  htmlList("Requirements", job.requirements);

const toLocation = (job) =>
  job.workMode === "remote"
    ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "India" } }
    : {
        jobLocation: {
          "@type": "Place",
          address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "IN" },
        },
      };

// Salaries are stored in LPA (lakhs per annum)
const toSalary = ({ salary }) =>
  salary?.min || salary?.max
    ? {
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: salary.currency || "INR",
          value: {
            "@type": "QuantitativeValue",
            ...(salary.min && { minValue: salary.min * LAKH }),
            ...(salary.max && { maxValue: salary.max * LAKH }),
            unitText: "YEAR",
          },
        },
      }
    : {};

const toJobPosting = (job) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: job.title,
  description: toDescriptionHtml(job),
  identifier: { "@type": "PropertyValue", name: job.company.name, value: job._id },
  url: window.location.origin + window.location.pathname,
  datePosted: job.createdAt,
  ...(job.deadline && { validThrough: job.deadline }),
  employmentType: EMPLOYMENT_TYPES[job.employmentType] ?? "OTHER",
  hiringOrganization: {
    "@type": "Organization",
    name: job.company.name,
    ...(job.company.website && { sameAs: job.company.website }),
    ...(job.company.logo?.url && { logo: job.company.logo.url }),
  },
  ...toLocation(job),
  ...toSalary(job),
  ...(job.experience?.min > 0 && {
    experienceRequirements: { "@type": "OccupationalExperienceRequirements", monthsOfExperience: job.experience.min * 12 },
  }),
  ...(job.skills?.length && { skills: job.skills.join(", ") }),
  totalJobOpenings: job.openings,
  directApply: true,
});

const JobPostingSchema = ({ job }) => {
  if (!job.isAcceptingApplications || job.source || !job.company) return null;

  // "<" is escaped so text in the post can never close the script tag
  const json = JSON.stringify(toJobPosting(job)).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
};

export default JobPostingSchema;

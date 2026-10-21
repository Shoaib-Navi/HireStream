// Usage: npm run seed            adds sample data to an empty development database
//        npm run seed -- --reset  deletes all users, companies, jobs and applications first
import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { APPLICATION_STATUS, ROLES } from "../constants/index.js";
import { runMigrations } from "../migrations/runner.js";
import { allModels } from "../models.js";
import { Application } from "../modules/applications/application.model.js";
import { hashPassword } from "../modules/auth/auth.service.js";
import { Company } from "../modules/companies/company.model.js";
import { Job } from "../modules/jobs/job.model.js";
import { CandidateProfile } from "../modules/users/candidateProfile.model.js";
import { User } from "../modules/users/user.model.js";
import { slugify } from "../utils/slugify.js";

const PASSWORD = "Password123";
const shouldReset = process.argv.includes("--reset");

const RECRUITERS = [
  { fullName: "Neha Kapoor", email: "neha.recruiter@hirestream.dev" },
  { fullName: "Vikram Rao", email: "vikram.recruiter@hirestream.dev" },
];

const CANDIDATES = [
  { fullName: "Aarav Sharma", email: "aarav@hirestream.dev", headline: "Frontend Developer", skills: ["React", "JavaScript", "Tailwind CSS"], experienceYears: 2, location: "Bangalore" },
  { fullName: "Isha Verma", email: "isha@hirestream.dev", headline: "Backend Engineer", skills: ["Node.js", "MongoDB", "Express"], experienceYears: 4, location: "Pune" },
  { fullName: "Kabir Mehta", email: "kabir@hirestream.dev", headline: "Data Analyst", skills: ["SQL", "Python", "Power BI"], experienceYears: 1, location: "Delhi" },
];

const COMPANIES = [
  { name: "Nimbus Labs", industry: "Software", size: "51-200", location: "Bangalore", website: "https://nimbuslabs.example.com", description: "Nimbus Labs builds cloud tools that help small teams ship faster." },
  { name: "Kite Payments", industry: "Fintech", size: "201-500", location: "Mumbai", website: "https://kitepayments.example.com", description: "Kite Payments powers online payments for thousands of Indian businesses." },
  { name: "GreenLeaf Health", industry: "Healthcare", size: "11-50", location: "Pune", website: "https://greenleaf.example.com", description: "GreenLeaf Health makes preventive care simple with connected health apps." },
];

const JOB_TEMPLATES = [
  { title: "Frontend Developer (React)", skills: ["React", "JavaScript", "CSS"], employmentType: "full-time", workMode: "hybrid", experience: { min: 1, max: 3 }, salary: { min: 6, max: 10 } },
  { title: "Senior Backend Engineer", skills: ["Node.js", "MongoDB", "AWS"], employmentType: "full-time", workMode: "remote", experience: { min: 4, max: 8 }, salary: { min: 18, max: 30 } },
  { title: "UI/UX Designer", skills: ["Figma", "User Research", "Prototyping"], employmentType: "full-time", workMode: "onsite", experience: { min: 2, max: 5 }, salary: { min: 8, max: 14 } },
  { title: "Data Analyst Intern", skills: ["SQL", "Excel", "Python"], employmentType: "internship", workMode: "onsite", experience: { min: 0, max: 1 }, salary: { min: 2, max: 3 } },
  { title: "DevOps Engineer", skills: ["Docker", "Kubernetes", "CI/CD"], employmentType: "full-time", workMode: "hybrid", experience: { min: 3, max: 6 }, salary: { min: 14, max: 22 } },
  { title: "Product Manager", skills: ["Roadmapping", "Analytics", "Communication"], employmentType: "full-time", workMode: "onsite", experience: { min: 3, max: 7 }, salary: { min: 20, max: 32 } },
  { title: "QA Automation Engineer", skills: ["Playwright", "JavaScript", "Testing"], employmentType: "contract", workMode: "remote", experience: { min: 2, max: 4 }, salary: { min: 7, max: 12 } },
  { title: "Content Writer (Part-time)", skills: ["Writing", "SEO", "Research"], employmentType: "part-time", workMode: "remote", experience: { min: 0, max: 2 }, salary: { min: 3, max: 5 } },
];

const buildDescription = (title, companyName) =>
  `${companyName} is looking for a ${title} to join our growing team. You will work closely with product, design and engineering to deliver features our customers love, take ownership of your work from idea to release, and help us keep raising the quality bar.`;

const run = async () => {
  if (env.isProduction) {
    throw new Error("Refusing to seed a production database");
  }
  await connectDB();
  await runMigrations({ log: () => {} });

  if (shouldReset) {
    await Promise.all(allModels.map((model) => model.deleteMany({})));
    console.log("Existing data removed");
  } else if (await User.exists({ email: RECRUITERS[0].email })) {
    console.log("Sample data already exists. Use --reset to recreate it.");
    return;
  }

  const password = await hashPassword(PASSWORD);
  const now = new Date();

  const recruiters = await User.insertMany(
    RECRUITERS.map((recruiter) => ({ ...recruiter, role: ROLES.RECRUITER, password, phone: "+91 90000 00000", emailVerifiedAt: now })),
  );
  const candidates = await User.insertMany(
    CANDIDATES.map(({ fullName, email }) => ({ fullName, email, role: ROLES.CANDIDATE, password, phone: "+91 91111 11111", emailVerifiedAt: now })),
  );
  await CandidateProfile.insertMany(
    CANDIDATES.map(({ headline, skills, experienceYears, location }, index) => ({
      user: candidates[index]._id,
      headline,
      skills,
      experienceYears,
      location,
      bio: `${headline} who enjoys solving real problems and learning new tools.`,
      resume: { url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", originalName: "resume.pdf", uploadedAt: now },
    })),
  );

  const companies = await Company.insertMany(
    COMPANIES.map((company, index) => ({
      ...company,
      slug: slugify(company.name),
      owner: recruiters[index % recruiters.length]._id,
      isVerified: index === 0,
    })),
  );

  const jobs = await Job.insertMany(
    JOB_TEMPLATES.map((template, index) => {
      const company = companies[index % companies.length];
      return {
        ...template,
        description: buildDescription(template.title, company.name),
        requirements: [`${template.experience.min}+ years of relevant experience`, `Hands-on skills in ${template.skills.join(", ")}`],
        responsibilities: ["Collaborate with a cross-functional team", "Own features from planning to release"],
        location: company.location,
        openings: (index % 3) + 1,
        company: company._id,
        postedBy: company.owner,
        createdAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000),
      };
    }),
  );

  const applications = [
    { job: jobs[0], candidate: candidates[0], status: APPLICATION_STATUS.SHORTLISTED },
    { job: jobs[1], candidate: candidates[1], status: APPLICATION_STATUS.INTERVIEW },
    { job: jobs[3], candidate: candidates[2], status: APPLICATION_STATUS.APPLIED },
    { job: jobs[6], candidate: candidates[0], status: APPLICATION_STATUS.APPLIED },
  ];
  await Application.insertMany(
    applications.map(({ job, candidate, status }) => ({
      job: job._id,
      candidate: candidate._id,
      company: job.company,
      status,
      resume: { url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", originalName: "resume.pdf" },
      statusHistory: [
        { status: APPLICATION_STATUS.APPLIED, changedBy: candidate._id },
        ...(status !== APPLICATION_STATUS.APPLIED ? [{ status, changedBy: job.postedBy }] : []),
      ],
    })),
  );
  for (const { job } of applications) {
    await Job.updateOne({ _id: job._id }, { $inc: { applicationCount: 1 } });
  }

  console.log(`Seeded ${recruiters.length + candidates.length} users, ${companies.length} companies, ${jobs.length} jobs`);
  console.log(`Log in with any seeded email and the password "${PASSWORD}", e.g. ${RECRUITERS[0].email} or ${CANDIDATES[0].email}`);
};

try {
  await run();
  await disconnectDB();
} catch (error) {
  console.error("Seeding failed:", error.message);
  await disconnectDB();
  process.exit(1);
}

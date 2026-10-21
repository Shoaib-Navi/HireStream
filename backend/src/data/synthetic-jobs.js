export const SYNTHETIC_PASSWORD = "Password123";

export const RECRUITERS = [
  { fullName: "Neha Kapoor", email: "neha.recruiter@hirestream.dev", phone: "+91 90000 00001" },
  { fullName: "Vikram Rao", email: "vikram.recruiter@hirestream.dev", phone: "+91 90000 00002" },
  { fullName: "Anita Desai", email: "anita.recruiter@hirestream.dev", phone: "+91 90000 00003" },
];

export const CANDIDATES = [
  {
    fullName: "Aarav Sharma",
    email: "aarav@hirestream.dev",
    headline: "Frontend Developer",
    skills: ["React", "JavaScript", "TypeScript", "Tailwind CSS"],
    experienceYears: 2,
    location: "Bangalore",
  },
  {
    fullName: "Isha Verma",
    email: "isha@hirestream.dev",
    headline: "Backend Engineer",
    skills: ["Node.js", "MongoDB", "Express", "AWS"],
    experienceYears: 4,
    location: "Pune",
  },
  {
    fullName: "Kabir Mehta",
    email: "kabir@hirestream.dev",
    headline: "Data Analyst",
    skills: ["SQL", "Python", "Power BI", "Excel"],
    experienceYears: 1,
    location: "Delhi",
  },
  {
    fullName: "Meera Nair",
    email: "meera@hirestream.dev",
    headline: "Product Designer",
    skills: ["Figma", "Prototyping", "User Research"],
    experienceYears: 5,
    location: "Remote",
  },
  {
    fullName: "Rohan Gupta",
    email: "rohan@hirestream.dev",
    headline: "DevOps Engineer",
    skills: ["Docker", "Kubernetes", "Terraform", "CI/CD"],
    experienceYears: 6,
    location: "Hyderabad",
  },
];

export const COMPANIES = [
  {
    name: "Nimbus Labs",
    industry: "Developer tools",
    size: "51-200",
    location: "Bangalore",
    foundedYear: 2018,
    website: "https://nimbuslabs.example.com",
    description: "Nimbus Labs builds cloud tooling that helps small engineering teams ship without a platform team of their own.",
  },
  {
    name: "Kite Payments",
    industry: "Fintech",
    size: "201-500",
    location: "Mumbai",
    foundedYear: 2015,
    website: "https://kitepayments.example.com",
    description: "Kite Payments handles online payments and payouts for Indian businesses, from first invoice to IPO scale.",
  },
  {
    name: "GreenLeaf Health",
    industry: "Healthcare",
    size: "11-50",
    location: "Pune",
    foundedYear: 2020,
    website: "https://greenleaf.example.com",
    description: "GreenLeaf Health makes preventive care routine with connected check-ups and a clinician-reviewed app.",
  },
  {
    name: "Bluecart Retail",
    industry: "E-commerce",
    size: "501-1000",
    location: "Gurugram",
    foundedYear: 2012,
    website: "https://bluecart.example.com",
    description: "Bluecart Retail runs the storefront, warehouse and delivery software behind several regional retail brands.",
  },
  {
    name: "Orbital Analytics",
    industry: "Data & analytics",
    size: "51-200",
    location: "Hyderabad",
    foundedYear: 2019,
    website: "https://orbitalanalytics.example.com",
    description: "Orbital Analytics turns messy operational data into dashboards that operations teams actually open.",
  },
  {
    name: "Study Circle",
    industry: "Education",
    size: "11-50",
    location: "Remote",
    foundedYear: 2021,
    website: "https://studycircle.example.com",
    description: "Study Circle runs small-group online classes for school students, with live tutors and practice tooling.",
  },
];

// company: index into COMPANIES. Salary is LPA. Every entry is invented.
export const JOBS = [
  { company: 0, title: "Frontend Developer (React)", employmentType: "full-time", workMode: "hybrid", location: "Bangalore", experience: { min: 1, max: 3 }, salary: { min: 6, max: 10 }, skills: ["React", "JavaScript", "CSS", "REST APIs"] },
  { company: 0, title: "Senior Backend Engineer", employmentType: "full-time", workMode: "remote", location: "Remote", experience: { min: 4, max: 8 }, salary: { min: 18, max: 30 }, skills: ["Node.js", "MongoDB", "AWS", "System Design"] },
  { company: 0, title: "Platform Engineer", employmentType: "full-time", workMode: "hybrid", location: "Bangalore", experience: { min: 3, max: 6 }, salary: { min: 16, max: 26 }, skills: ["Kubernetes", "Terraform", "Go", "Observability"] },
  { company: 0, title: "Developer Advocate", employmentType: "full-time", workMode: "remote", location: "Remote", experience: { min: 2, max: 5 }, salary: { min: 12, max: 20 }, skills: ["Technical Writing", "Public Speaking", "JavaScript"] },
  { company: 0, title: "QA Automation Engineer", employmentType: "contract", workMode: "remote", location: "Remote", experience: { min: 2, max: 4 }, salary: { min: 7, max: 12 }, skills: ["Playwright", "JavaScript", "Test Strategy"] },
  { company: 1, title: "Payments Backend Engineer", employmentType: "full-time", workMode: "onsite", location: "Mumbai", experience: { min: 3, max: 7 }, salary: { min: 20, max: 34 }, skills: ["Java", "PostgreSQL", "Kafka", "Distributed Systems"] },
  { company: 1, title: "Risk Analyst", employmentType: "full-time", workMode: "onsite", location: "Mumbai", experience: { min: 2, max: 5 }, salary: { min: 10, max: 16 }, skills: ["SQL", "Python", "Fraud Analytics"] },
  { company: 1, title: "Android Engineer", employmentType: "full-time", workMode: "hybrid", location: "Mumbai", experience: { min: 2, max: 6 }, salary: { min: 14, max: 24 }, skills: ["Kotlin", "Android", "REST APIs"] },
  { company: 1, title: "Compliance Associate", employmentType: "full-time", workMode: "onsite", location: "Mumbai", experience: { min: 1, max: 4 }, salary: { min: 7, max: 12 }, skills: ["KYC", "Documentation", "Audit"] },
  { company: 1, title: "Product Manager, Merchant Tools", employmentType: "full-time", workMode: "hybrid", location: "Mumbai", experience: { min: 4, max: 8 }, salary: { min: 24, max: 40 }, skills: ["Roadmapping", "Analytics", "Stakeholder Management"] },
  { company: 1, title: "Finance Intern", employmentType: "internship", workMode: "onsite", location: "Mumbai", experience: { min: 0, max: 1 }, salary: { min: 2, max: 4 }, skills: ["Excel", "Accounting"] },
  { company: 2, title: "Full Stack Developer", employmentType: "full-time", workMode: "hybrid", location: "Pune", experience: { min: 2, max: 5 }, salary: { min: 10, max: 18 }, skills: ["React", "Node.js", "PostgreSQL"] },
  { company: 2, title: "Clinical Content Writer", employmentType: "part-time", workMode: "remote", location: "Remote", experience: { min: 1, max: 4 }, salary: { min: 4, max: 7 }, skills: ["Medical Writing", "Research", "Editing"] },
  { company: 2, title: "Mobile Engineer (Flutter)", employmentType: "full-time", workMode: "remote", location: "Remote", experience: { min: 2, max: 5 }, salary: { min: 12, max: 20 }, skills: ["Flutter", "Dart", "Mobile"] },
  { company: 2, title: "Customer Success Associate", employmentType: "full-time", workMode: "onsite", location: "Pune", experience: { min: 0, max: 3 }, salary: { min: 4, max: 8 }, skills: ["Communication", "CRM", "Support"] },
  { company: 3, title: "Warehouse Systems Analyst", employmentType: "full-time", workMode: "onsite", location: "Gurugram", experience: { min: 2, max: 5 }, salary: { min: 8, max: 14 }, skills: ["SQL", "ERP", "Process Mapping"] },
  { company: 3, title: "Senior Data Engineer", employmentType: "full-time", workMode: "hybrid", location: "Gurugram", experience: { min: 5, max: 9 }, salary: { min: 25, max: 40 }, skills: ["Spark", "Airflow", "Python", "AWS"] },
  { company: 3, title: "UI/UX Designer", employmentType: "full-time", workMode: "hybrid", location: "Gurugram", experience: { min: 2, max: 5 }, salary: { min: 9, max: 15 }, skills: ["Figma", "User Research", "Prototyping"] },
  { company: 3, title: "Category Manager", employmentType: "full-time", workMode: "onsite", location: "Gurugram", experience: { min: 3, max: 7 }, salary: { min: 14, max: 22 }, skills: ["Merchandising", "Negotiation", "Analytics"] },
  { company: 3, title: "Delivery Operations Intern", employmentType: "internship", workMode: "onsite", location: "Gurugram", experience: { min: 0, max: 1 }, salary: { min: 2, max: 3 }, skills: ["Excel", "Operations"] },
  { company: 4, title: "Data Analyst", employmentType: "full-time", workMode: "hybrid", location: "Hyderabad", experience: { min: 1, max: 4 }, salary: { min: 7, max: 13 }, skills: ["SQL", "Power BI", "Python"] },
  { company: 4, title: "Machine Learning Engineer", employmentType: "full-time", workMode: "remote", location: "Remote", experience: { min: 3, max: 7 }, salary: { min: 22, max: 38 }, skills: ["Python", "Machine Learning", "MLOps"] },
  { company: 4, title: "Analytics Engineer", employmentType: "full-time", workMode: "hybrid", location: "Hyderabad", experience: { min: 2, max: 5 }, salary: { min: 12, max: 20 }, skills: ["dbt", "SQL", "Snowflake"] },
  { company: 4, title: "DevOps Engineer", employmentType: "full-time", workMode: "hybrid", location: "Hyderabad", experience: { min: 3, max: 6 }, salary: { min: 15, max: 24 }, skills: ["Docker", "Kubernetes", "CI/CD", "Terraform"] },
  { company: 4, title: "Technical Support Engineer", employmentType: "contract", workMode: "remote", location: "Remote", experience: { min: 1, max: 3 }, salary: { min: 5, max: 9 }, skills: ["Troubleshooting", "SQL", "Support"] },
  { company: 5, title: "Online Maths Tutor", employmentType: "part-time", workMode: "remote", location: "Remote", experience: { min: 0, max: 3 }, salary: { min: 3, max: 6 }, skills: ["Teaching", "Mathematics", "Communication"] },
  { company: 5, title: "Curriculum Designer", employmentType: "full-time", workMode: "remote", location: "Remote", experience: { min: 2, max: 6 }, salary: { min: 8, max: 14 }, skills: ["Curriculum Design", "Editing", "Assessment"] },
  { company: 5, title: "Growth Marketer", employmentType: "full-time", workMode: "remote", location: "Remote", experience: { min: 2, max: 5 }, salary: { min: 9, max: 16 }, skills: ["SEO", "Paid Ads", "Analytics"] },
  { company: 5, title: "Frontend Engineer (Vue)", employmentType: "full-time", workMode: "remote", location: "Remote", experience: { min: 1, max: 4 }, salary: { min: 8, max: 15 }, skills: ["Vue.js", "JavaScript", "CSS"] },
  { company: 5, title: "Community Manager", employmentType: "freelance", workMode: "remote", location: "Remote", experience: { min: 1, max: 3 }, salary: { min: 4, max: 8 }, skills: ["Community", "Social Media", "Writing"] },
];

export const describeJob = (title, companyName, skills) =>
  `${companyName} is hiring a ${title}. You'll work with a small, senior team that ships weekly, own your work from problem statement through release, and help shape how we build. Day to day you'll use ${skills.slice(0, 3).join(", ")}, review each other's work, and talk directly to the people who use what we build. This is sample data for local development, not a real vacancy.`;

export const jobExtras = (experience, skills) => ({
  requirements: [
    `${experience.min}+ years of relevant experience`,
    `Hands-on with ${skills.slice(0, 3).join(", ")}`,
    "Clear written communication and a habit of asking questions early",
  ],
  responsibilities: [
    "Own features from problem statement to release",
    "Work with product and design on scope and trade-offs",
    "Review code and share what you learn with the team",
  ],
});

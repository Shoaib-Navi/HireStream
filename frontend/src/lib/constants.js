// Mirrors the backend constants (backend/src/constants) with display labels and badge tones

export const ROLES = Object.freeze({
  CANDIDATE: "candidate",
  RECRUITER: "recruiter",
  ADMIN: "admin",
});

export const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

export const WORK_MODES = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"].map((size) => ({
  value: size,
  label: `${size} employees`,
}));

export const JOB_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "salary", label: "Highest salary" },
];

// Minimum annual salary filters, in LPA
export const SALARY_FILTERS = [
  { value: "3", label: "₹3 LPA+" },
  { value: "6", label: "₹6 LPA+" },
  { value: "10", label: "₹10 LPA+" },
  { value: "20", label: "₹20 LPA+" },
];

export const EXPERIENCE_FILTERS = [
  { value: "0", label: "Fresher" },
  { value: "2", label: "Up to 2 years" },
  { value: "5", label: "Up to 5 years" },
  { value: "10", label: "Up to 10 years" },
];

// tone = Badge variant used to display the status
export const JOB_STATUS_META = {
  draft: { label: "Draft", tone: "neutral" },
  open: { label: "Open", tone: "success" },
  closed: { label: "Closed", tone: "danger" },
};

export const APPLICATION_STATUS_META = {
  applied: { label: "Applied", tone: "info" },
  shortlisted: { label: "Shortlisted", tone: "brand" },
  interview: { label: "Interview", tone: "warning" },
  offered: { label: "Offered", tone: "highlight" },
  hired: { label: "Hired", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
};

// Statuses a recruiter can move an application to, in pipeline order
export const RECRUITER_STATUSES = ["shortlisted", "interview", "offered", "hired", "rejected"];

export const MAX_UPLOAD_MB = 5;

export const labelFor = (options, value) => options.find((option) => option.value === value)?.label ?? value;

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
  draft: { label: "Draft", tone: "status-muted" },
  open: { label: "Open", tone: "status-quiet" },
  closed: { label: "Closed", tone: "status-muted" },
};

// Statuses read as monochrome chips: quiet for settled/advanced, muted for in-flight,
// and the dark tone reserved for rejected alone. Applied and interview are not in the
// palette, so they take the in-flight tone rather than a colour of their own.
export const APPLICATION_STATUS_META = {
  applied: { label: "Applied", tone: "status-muted" },
  shortlisted: { label: "Shortlisted", tone: "status-quiet" },
  interview: { label: "Interview", tone: "status-muted" },
  offered: { label: "Offered", tone: "status-muted" },
  hired: { label: "Hired", tone: "status-quiet" },
  rejected: { label: "Rejected", tone: "status-strong" },
  withdrawn: { label: "Withdrawn", tone: "status-muted" },
};

// Statuses a recruiter can move an application to, in pipeline order
export const RECRUITER_STATUSES = ["shortlisted", "interview", "offered", "hired", "rejected"];

// A candidate can withdraw while the application is still in progress
export const WITHDRAWABLE_STATUSES = ["applied", "shortlisted", "interview", "offered"];

export const USER_STATUS_META = {
  active: { label: "Active", tone: "status-quiet" },
  suspended: { label: "Suspended", tone: "status-muted" },
};

export const COMPANY_STATUS_META = {
  active: { label: "Active", tone: "status-quiet" },
  suspended: { label: "Suspended", tone: "status-muted" },
};

// Roles label who someone is rather than a status, so they stay neutral;
// admin is the one worth picking out, and uses the informational tone.
export const ROLE_META = {
  candidate: { label: "Job seeker", tone: "neutral" },
  recruiter: { label: "Recruiter", tone: "neutral" },
  admin: { label: "Admin", tone: "info" },
};

export const MAX_UPLOAD_MB = 5;

export const labelFor = (options, value) => options.find((option) => option.value === value)?.label ?? value;

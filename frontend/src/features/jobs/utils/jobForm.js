// Converts between the flat job form state and the API's nested job shape

export const EMPTY_JOB_FORM = {
  companyId: "",
  title: "",
  employmentType: "full-time",
  workMode: "onsite",
  location: "",
  openings: "1",
  deadline: "",
  experienceMin: "0",
  experienceMax: "",
  salaryMin: "",
  salaryMax: "",
  description: "",
  responsibilities: [],
  requirements: [],
  skills: [],
};

const toNumberOrNull = (value) => (value === "" || value === null || value === undefined ? null : Number(value));

const toInputNumber = (value) => (value === null || value === undefined ? "" : String(value));

// Existing job -> form values (used when editing)
export const toJobFormValues = (job) => ({
  companyId: job.company?._id ?? job.company ?? "",
  title: job.title ?? "",
  employmentType: job.employmentType ?? EMPTY_JOB_FORM.employmentType,
  workMode: job.workMode ?? EMPTY_JOB_FORM.workMode,
  location: job.location ?? "",
  openings: toInputNumber(job.openings ?? 1),
  deadline: job.deadline ? String(job.deadline).slice(0, 10) : "",
  experienceMin: toInputNumber(job.experience?.min ?? 0),
  experienceMax: toInputNumber(job.experience?.max),
  salaryMin: toInputNumber(job.salary?.min),
  salaryMax: toInputNumber(job.salary?.max),
  description: job.description ?? "",
  responsibilities: job.responsibilities ?? [],
  requirements: job.requirements ?? [],
  skills: job.skills ?? [],
});

// Form values -> API payload. `status` is only sent when creating a job.
export const toJobPayload = (values, status) => ({
  companyId: values.companyId,
  title: values.title,
  employmentType: values.employmentType,
  workMode: values.workMode,
  location: values.location,
  openings: Number(values.openings) || 1,
  deadline: values.deadline || null,
  experience: { min: Number(values.experienceMin) || 0, max: toNumberOrNull(values.experienceMax) },
  salary: { min: toNumberOrNull(values.salaryMin), max: toNumberOrNull(values.salaryMax) },
  description: values.description,
  responsibilities: values.responsibilities,
  requirements: values.requirements,
  skills: values.skills,
  ...(status && { status }),
});

// API validation paths -> form field names
const FIELD_NAMES = {
  "experience.min": "experienceMin",
  "experience.max": "experienceMax",
  "salary.min": "salaryMin",
  "salary.max": "salaryMax",
};

export const toJobFormError = (error) => ({
  ...error,
  errors: (error?.errors ?? []).map((item) => ({ ...item, field: FIELD_NAMES[item.field] ?? item.field.split(".")[0] })),
});

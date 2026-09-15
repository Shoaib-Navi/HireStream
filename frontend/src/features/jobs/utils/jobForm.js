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
  status,
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

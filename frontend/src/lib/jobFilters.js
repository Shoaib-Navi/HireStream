export const JOB_FILTERS = [
  {
    type: "Location",
    options: ["Delhi", "Noida", "Gurugram", "Hyderabad", "Bangalore", "Pune", "Mumbai"],
  },
  {
    type: "Role",
    options: ["Frontend Developer", "Backend Developer", "FullStack Developer"],
  },
  {
    // job.salary is stored in LPA
    type: "Salary",
    options: ["0-5 LPA", "5-10 LPA", "10-20 LPA", "20+ LPA"],
  },
];

const SALARY_RANGES = {
  "0-5 LPA": [0, 5],
  "5-10 LPA": [5, 10],
  "10-20 LPA": [10, 20],
  "20+ LPA": [20, Infinity],
};

const includesText = (value, search) => value?.toLowerCase().includes(search.toLowerCase());

const MATCHERS = {
  Location: (job, value) => includesText(job.location, value),
  Role: (job, value) => includesText(job.title, value),
  Salary: (job, value) => {
    const [min, max] = SALARY_RANGES[value] ?? [0, Infinity];
    return job.salary >= min && job.salary < max;
  },
};

// activeFilters looks like { Location: ["Delhi"], Salary: ["5-10 LPA"] }.
// A job matches when it satisfies every category that has a selection.
export const matchesFilters = (job, activeFilters) =>
  Object.entries(activeFilters).every(
    ([type, values]) => !values?.length || values.some((value) => MATCHERS[type]?.(job, value) ?? true),
  );

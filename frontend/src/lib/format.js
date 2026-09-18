// Display formatting for dates, money, experience and names

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const numberFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : "");

const monthYearFormatter = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" });

export const formatMonthYear = (value) => (value ? monthYearFormatter.format(new Date(value)) : "");

const RELATIVE_UNITS = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

// "2 days ago", "yesterday", "just now"
export const formatRelativeTime = (value) => {
  if (!value) return "";
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return relativeFormatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return "just now";
};

export const formatNumber = (value) => numberFormatter.format(value ?? 0);

// Salary ranges are stored in LPA (lakhs per annum)
export const formatSalary = (salary) => {
  const { min, max } = salary ?? {};
  const hasMin = min !== null && min !== undefined;
  const hasMax = max !== null && max !== undefined;
  if (!hasMin && !hasMax) return "Salary not disclosed";
  if (hasMin && hasMax && min !== max) return `₹${formatNumber(min)}–${formatNumber(max)} LPA`;
  return `₹${formatNumber(hasMin ? min : max)} LPA`;
};

export const formatExperience = (experience) => {
  const min = experience?.min ?? 0;
  const max = experience?.max;
  if (max === null || max === undefined) return min === 0 ? "Freshers welcome" : `${min}+ yrs`;
  if (min === max) return `${min} yrs`;
  return `${min}–${max} yrs`;
};

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`;

export const getInitials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");


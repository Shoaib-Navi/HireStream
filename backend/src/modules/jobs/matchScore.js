// How well a candidate profile fits a job, as a 0-100 score.
// Deterministic and explainable: skills carry the most weight, then experience, then location.
const WEIGHTS = { skills: 60, experience: 25, location: 15 };

const normalize = (value) => String(value).trim().toLowerCase();

const scoreSkills = (jobSkills, profileSkills) => {
  if (jobSkills.length === 0) return { points: WEIGHTS.skills, matched: [], missing: [] };

  const owned = new Set(profileSkills.map(normalize));
  const matched = jobSkills.filter((skill) => owned.has(normalize(skill)));
  const missing = jobSkills.filter((skill) => !owned.has(normalize(skill)));

  return { points: (matched.length / jobSkills.length) * WEIGHTS.skills, matched, missing };
};

// Unknown experience scores half, so a thin profile isn't treated as a mismatch
const scoreExperience = (required, years) => {
  if (years === undefined || years === null) return WEIGHTS.experience * 0.5;
  if (!required || years >= required) return WEIGHTS.experience;
  return (years / required) * WEIGHTS.experience;
};

const scoreLocation = (job, profile) => {
  if (job.workMode === "remote") return WEIGHTS.location;

  const jobLocation = job.location ? normalize(job.location) : "";
  if (!jobLocation) return WEIGHTS.location * 0.5;

  const candidateLocations = [profile.location, ...(profile.preferences?.locations ?? [])].filter(Boolean).map(normalize);
  if (candidateLocations.length === 0) return WEIGHTS.location * 0.5;

  const matches = candidateLocations.some(
    (location) => location.includes(jobLocation) || jobLocation.includes(location),
  );
  return matches ? WEIGHTS.location : 0;
};

// Returns null when there's no profile to compare against
export const calculateMatch = (job, profile) => {
  if (!profile) return null;

  const skills = scoreSkills(job.skills ?? [], profile.skills ?? []);
  const points = skills.points + scoreExperience(job.experience?.min, profile.experienceYears) + scoreLocation(job, profile);

  return {
    score: Math.round(points),
    matchedSkills: skills.matched,
    missingSkills: skills.missing,
  };
};

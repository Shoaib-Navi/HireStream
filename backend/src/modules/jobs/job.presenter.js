// Shapes jobs for list views (job board, saved jobs)

export const CARD_COMPANY_FIELDS = "name slug logo location isVerified";

const SUMMARY_LENGTH = 220;

// Job cards only need a short summary instead of the full description, and none of the internal fields
export const toJobCard = ({
  description = "",
  requirements: _requirements,
  responsibilities: _responsibilities,
  companyActive: _companyActive,
  relevance: _relevance,
  ...job
}) => ({
  ...job,
  summary: description.length > SUMMARY_LENGTH ? `${description.slice(0, SUMMARY_LENGTH).trimEnd()}…` : description,
});

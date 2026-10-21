export const ROLES = Object.freeze({
  CANDIDATE: "candidate",
  RECRUITER: "recruiter",
  ADMIN: "admin",
});

// Roles a visitor can choose at sign up (admins are created with a script)
export const SIGNUP_ROLES = [ROLES.CANDIDATE, ROLES.RECRUITER];

export const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  SUSPENDED: "suspended",
});

export const COMPANY_STATUS = Object.freeze({
  ACTIVE: "active",
  SUSPENDED: "suspended",
});

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "internship", "freelance"];

export const WORK_MODES = ["onsite", "remote", "hybrid"];

export const JOB_STATUS = Object.freeze({
  DRAFT: "draft",
  OPEN: "open",
  CLOSED: "closed",
});

export const APPLICATION_STATUS = Object.freeze({
  APPLIED: "applied",
  SHORTLISTED: "shortlisted",
  INTERVIEW: "interview",
  OFFERED: "offered",
  HIRED: "hired",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
});

// Statuses a recruiter can move an application to
export const RECRUITER_STATUSES = [
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.INTERVIEW,
  APPLICATION_STATUS.OFFERED,
  APPLICATION_STATUS.HIRED,
  APPLICATION_STATUS.REJECTED,
];

// A candidate can withdraw while the application is still in progress
export const WITHDRAWABLE_STATUSES = [
  APPLICATION_STATUS.APPLIED,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.INTERVIEW,
  APPLICATION_STATUS.OFFERED,
];

export const SESSION_DAYS = 7;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Single-use links sent by email
export const TOKEN_PURPOSE = Object.freeze({
  EMAIL_VERIFICATION: "email_verification",
  PASSWORD_RESET: "password_reset",
});

export const EMAIL_VERIFICATION_HOURS = 24;
export const PASSWORD_RESET_MINUTES = 30;

export const NOTIFICATION_TYPES = Object.freeze({
  APPLICATION_RECEIVED: "application_received",
  APPLICATION_STATUS: "application_status",
  APPLICATION_WITHDRAWN: "application_withdrawn",
});

export const NOTIFICATION_RETENTION_DAYS = 90;

// Where a seeded development record came from. Records created by real users stay unmarked.
export const DATA_SOURCES = Object.freeze({
  PUBLIC_SOURCE: "PUBLIC_SOURCE",
  SYNTHETIC: "SYNTHETIC",
});

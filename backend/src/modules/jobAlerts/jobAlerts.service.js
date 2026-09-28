import { ALERT_FREQUENCIES, DUPLICATE_KEY_ERROR, MAX_JOB_ALERTS, NOTIFICATION_TYPES, USER_STATUS, WORK_MODE_LABELS } from "../../constants/index.js";
import { sendEmail } from "../../services/email.js";
import { ApiError } from "../../utils/ApiError.js";
import { CARD_COMPANY_FIELDS } from "../jobs/job.presenter.js";
import { Job } from "../jobs/job.model.js";
import { jobSearchFilter } from "../jobs/jobs.service.js";
import { createNotification } from "../notifications/notifications.service.js";
import { jobAlertEmail } from "./jobAlerts.emails.js";
import { JobAlert } from "./jobAlert.model.js";

const HOUR = 60 * 60 * 1000;
// A little under a day or a week, so a cron run that starts a few minutes early still counts
const DUE_AFTER = {
  [ALERT_FREQUENCIES.DAILY]: 20 * HOUR,
  [ALERT_FREQUENCIES.WEEKLY]: 6 * 24 * HOUR + 20 * HOUR,
};
// Alerts handled per run, oldest first; any left over go out on the next run
const MAX_ALERTS_PER_RUN = 200;
const BATCH_SIZE = 10;
const JOBS_PER_EMAIL = 10;

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

// Drops empty values and sorts lists, so equal searches always look the same
const normalizeCriteria = ({ q, location, employmentType, workMode, experience, salaryMin }) => ({
  ...(q && { q }),
  ...(location && { location }),
  ...(employmentType?.length && { employmentType: [...employmentType].sort() }),
  ...(workMode?.length && { workMode: [...workMode].sort() }),
  ...(experience !== undefined && { experience }),
  ...(salaryMin !== undefined && { salaryMin }),
});

const criteriaKey = (criteria) => JSON.stringify(criteria).toLowerCase();

// e.g. "react" in Bangalore · Remote, Hybrid · Full-time · ₹6 LPA+
export const describeCriteria = ({ q, location, employmentType, workMode, experience, salaryMin }) =>
  [
    `${q ? `"${q}"` : "All jobs"}${location ? ` in ${location}` : ""}`,
    workMode?.length && workMode.map((mode) => WORK_MODE_LABELS[mode]).join(", "),
    employmentType?.length && employmentType.map(capitalize).join(", "),
    experience !== undefined && experience !== null && `${experience}+ yrs experience`,
    salaryMin !== undefined && salaryMin !== null && `₹${salaryMin} LPA+`,
  ]
    .filter(Boolean)
    .join(" · ");

// The job board search for these criteria, newest first
export const criteriaLink = (criteria) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(criteria)) {
    if (value === undefined || value === null || value === "" || value?.length === 0) continue;
    params.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  params.set("sort", "newest");
  return `/jobs?${params}`;
};

const toAlert = (alert) => {
  const criteria = alert.criteria ?? {};
  return {
    _id: alert._id,
    criteria,
    frequency: alert.frequency,
    isActive: alert.isActive,
    lastCheckedAt: alert.lastCheckedAt,
    createdAt: alert.createdAt,
    summary: describeCriteria(criteria),
    link: criteriaLink(criteria),
  };
};

export const listAlerts = async (userId) => {
  const alerts = await JobAlert.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return alerts.map(toAlert);
};

export const createAlert = async (userId, { criteria, frequency }) => {
  const count = await JobAlert.countDocuments({ user: userId });
  if (count >= MAX_JOB_ALERTS) {
    throw ApiError.badRequest(`You can have up to ${MAX_JOB_ALERTS} job alerts. Delete one to add another.`);
  }

  const normalized = normalizeCriteria(criteria);
  try {
    const alert = await JobAlert.create({ user: userId, criteria: normalized, key: criteriaKey(normalized), frequency });
    return toAlert(alert.toObject());
  } catch (error) {
    if (error.code === DUPLICATE_KEY_ERROR) {
      throw ApiError.conflict("You already have an alert for this search");
    }
    throw error;
  }
};

// Resuming a paused alert starts fresh, so it doesn't send everything posted while it was paused
export const updateAlert = async (userId, alertId, { frequency, isActive }) => {
  const alert = await JobAlert.findOne({ _id: alertId, user: userId });
  if (!alert) {
    throw ApiError.notFound("Job alert not found");
  }

  if (frequency) alert.frequency = frequency;
  if (isActive !== undefined) {
    if (isActive && !alert.isActive) alert.lastCheckedAt = new Date();
    alert.isActive = isActive;
  }
  await alert.save();
  return toAlert(alert.toObject());
};

export const deleteAlert = async (userId, alertId) => {
  const { deletedCount } = await JobAlert.deleteOne({ _id: alertId, user: userId });
  if (deletedCount === 0) {
    throw ApiError.notFound("Job alert not found");
  }
};

// Emails and notifies the candidate about jobs posted since the last check. Never throws,
// so one failing alert can't stop the others in the run.
const runAlert = async (alert, now) => {
  try {
    const { $and: conditions } = jobSearchFilter(alert.criteria ?? {});
    const filter = { $and: [...conditions, { createdAt: { $gt: alert.lastCheckedAt, $lte: now } }] };
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .select("title location workMode salary company")
        .sort({ createdAt: -1 })
        .limit(JOBS_PER_EMAIL)
        .populate({ path: "company", select: CARD_COMPANY_FIELDS })
        .lean(),
      Job.countDocuments(filter),
    ]);

    if (total > 0) {
      const summary = describeCriteria(alert.criteria ?? {});
      const link = criteriaLink(alert.criteria ?? {});
      const title = `${total} new ${total === 1 ? "job" : "jobs"} for ${summary}`;
      await Promise.all([
        createNotification({ user: alert.user._id, type: NOTIFICATION_TYPES.JOB_ALERT, title, link }),
        sendEmail(jobAlertEmail({ user: alert.user, title, jobs, total, link })),
      ]);
    }

    await JobAlert.updateOne({ _id: alert._id }, { lastCheckedAt: now });
    return total > 0;
  } catch (error) {
    console.error(`Job alert ${alert._id} failed:`, error.message);
    return false;
  }
};

// Called by the scheduler (Vercel Cron). Handles the alerts that are due, oldest first.
export const dispatchDueAlerts = async (now = new Date()) => {
  const due = Object.entries(DUE_AFTER).map(([frequency, interval]) => ({
    frequency,
    lastCheckedAt: { $lte: new Date(now.getTime() - interval) },
  }));

  const alerts = await JobAlert.find({ isActive: true, $or: due })
    .sort({ lastCheckedAt: 1 })
    .limit(MAX_ALERTS_PER_RUN)
    .populate({ path: "user", select: "fullName email status" })
    .lean();

  // Suspended or deleted accounts get nothing; their alerts simply wait
  const deliverable = alerts.filter((alert) => alert.user?.status === USER_STATUS.ACTIVE);

  let sent = 0;
  for (let index = 0; index < deliverable.length; index += BATCH_SIZE) {
    const results = await Promise.all(deliverable.slice(index, index + BATCH_SIZE).map((alert) => runAlert(alert, now)));
    sent += results.filter(Boolean).length;
  }

  return { checked: deliverable.length, sent };
};

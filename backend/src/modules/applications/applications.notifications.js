import { APPLICATION_STATUS, NOTIFICATION_TYPES } from "../../constants/index.js";
import { sendEmail } from "../../services/email.js";
import { appLink, renderEmail } from "../../services/emailLayout.js";
import { createNotification } from "../notifications/notifications.service.js";

const candidateLink = (applicationId) => `/dashboard/applications/${applicationId}`;
const recruiterLink = (applicationId) => `/recruiter/applications/${applicationId}`;

const STATUS_TITLES = {
  [APPLICATION_STATUS.APPLIED]: ({ job }) => `Your application for ${job} is under review again`,
  [APPLICATION_STATUS.SHORTLISTED]: ({ job, company }) => `You've been shortlisted for ${job} at ${company}`,
  [APPLICATION_STATUS.INTERVIEW]: ({ job, company }) => `${company} would like to interview you for ${job}`,
  [APPLICATION_STATUS.OFFERED]: ({ job, company }) => `You've received an offer for ${job} at ${company}`,
  [APPLICATION_STATUS.HIRED]: ({ job, company }) => `Congratulations! You're hired as ${job} at ${company}`,
  [APPLICATION_STATUS.REJECTED]: ({ job, company }) => `Update on your application for ${job} at ${company}`,
};

// Notifications are a side effect: failures are logged and never fail the action that caused them
const safely = async (label, task) => {
  try {
    await task();
  } catch (error) {
    console.error(`Notification "${label}" failed:`, error.message);
  }
};

export const notifyApplicationReceived = ({ applicationId, recruiterId, candidateName, jobTitle }) =>
  safely("application received", () =>
    createNotification({
      user: recruiterId,
      type: NOTIFICATION_TYPES.APPLICATION_RECEIVED,
      title: `New applicant for ${jobTitle}`,
      body: `${candidateName} applied.`,
      link: recruiterLink(applicationId),
    }),
  );

export const notifyApplicationWithdrawn = ({ applicationId, recruiterId, candidateName, jobTitle }) =>
  safely("application withdrawn", () =>
    createNotification({
      user: recruiterId,
      type: NOTIFICATION_TYPES.APPLICATION_WITHDRAWN,
      title: `${candidateName} withdrew their application`,
      body: `For ${jobTitle}.`,
      link: recruiterLink(applicationId),
    }),
  );

// In-app notification and email to the candidate
export const notifyStatusChanged = ({ applicationId, candidate, status, note, jobTitle, companyName }) =>
  safely("status changed", async () => {
    const buildTitle = STATUS_TITLES[status] ?? (({ job }) => `Your application for ${job} was updated`);
    const title = buildTitle({ job: jobTitle, company: companyName });
    const link = candidateLink(applicationId);

    await Promise.all([
      createNotification({
        user: candidate._id,
        type: NOTIFICATION_TYPES.APPLICATION_STATUS,
        title,
        body: note,
        link,
      }),
      sendEmail({
        to: candidate.email,
        subject: title,
        ...renderEmail({
          heading: title,
          paragraphs: [`Hi ${candidate.fullName.split(" ")[0]},`, note ? `Message from ${companyName}:\n${note}` : null].filter(Boolean),
          action: { label: "View application", url: appLink(link) },
        }),
      }),
    ]);
  });

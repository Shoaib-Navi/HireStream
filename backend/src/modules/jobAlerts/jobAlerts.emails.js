import { WORK_MODE_LABELS } from "../../constants/index.js";
import { appLink, renderEmail } from "../../services/emailLayout.js";

// New jobs for one saved search: the newest ones listed, with a link to the full search
export const jobAlertEmail = ({ user, title, jobs, total, link }) => ({
  to: user.email,
  subject: title,
  ...renderEmail({
    heading: title,
    paragraphs: [`Hi ${user.fullName.split(" ")[0]}, these jobs were posted since your last update.`],
    items: jobs.map((job) => ({
      title: job.title,
      detail: [job.company?.name, job.location, WORK_MODE_LABELS[job.workMode]].filter(Boolean).join(" · "),
      url: appLink(`/jobs/${job._id}`),
    })),
    action: { label: total > jobs.length ? `See all ${total} jobs` : "See these jobs", url: appLink(link) },
    footnote: "You can pause, change or delete this alert under Job alerts in your dashboard.",
  }),
});

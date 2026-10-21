import { Application } from "./modules/applications/application.model.js";
import { AuthToken } from "./modules/auth/authToken.model.js";
import { Company } from "./modules/companies/company.model.js";
import { Job } from "./modules/jobs/job.model.js";
import { Notification } from "./modules/notifications/notification.model.js";
import { SavedJob } from "./modules/savedJobs/savedJob.model.js";
import { CandidateProfile } from "./modules/users/candidateProfile.model.js";
import { User } from "./modules/users/user.model.js";

// Every Mongoose model, used by scripts that create indexes or reset data
export const allModels = [User, CandidateProfile, Company, Job, Application, SavedJob, AuthToken, Notification];

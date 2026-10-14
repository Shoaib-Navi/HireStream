import * as v2Schema from "./001-v2-schema.js";
import * as jobCompanyActive from "./002-job-company-active.js";

// Run in this order; each migration runs once and is recorded in the "migrations" collection
export const migrations = [v2Schema, jobCompanyActive];

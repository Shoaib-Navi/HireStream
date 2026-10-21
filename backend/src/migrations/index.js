import * as v2Schema from "./001-v2-schema.js";

// Run in this order; each migration runs once and is recorded in the "migrations" collection
export const migrations = [v2Schema];

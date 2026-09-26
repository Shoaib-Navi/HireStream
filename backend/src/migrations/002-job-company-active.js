export const name = "002-job-company-active";

// Copies each company's suspension onto its jobs, so public listings can filter on the job alone
export const up = async (db, log) => {
  const suspendedIds = await db.collection("companies").distinct("_id", { status: "suspended" });
  const hidden = await db.collection("jobs").updateMany({ company: { $in: suspendedIds } }, { $set: { companyActive: false } });
  const shown = await db
    .collection("jobs")
    .updateMany({ company: { $nin: suspendedIds }, companyActive: { $exists: false } }, { $set: { companyActive: true } });
  log(`Marked ${hidden.modifiedCount} jobs hidden and ${shown.modifiedCount} jobs active`);
};

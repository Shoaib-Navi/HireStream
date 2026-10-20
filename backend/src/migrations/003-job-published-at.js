export const name = "003-job-published-at";

// Jobs posted before publishedAt existed went live when they were created
export const up = async (db, log) => {
  const { modifiedCount } = await db
    .collection("jobs")
    .updateMany({ status: { $ne: "draft" }, publishedAt: { $exists: false } }, [{ $set: { publishedAt: "$createdAt" } }]);
  log(`Publication dates set on ${modifiedCount} jobs`);
};

// Counts documents per value of a field, as { value: count }
export const countBy = async (model, field, match = {}) => {
  const rows = await model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  return Object.fromEntries(rows.map((row) => [String(row._id), row.count]));
};

export const sumCounts = (counts) => Object.values(counts).reduce((sum, count) => sum + count, 0);

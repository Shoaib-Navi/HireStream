// Drops empty values so they don't end up in the query string
export const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0),
    ),
  );

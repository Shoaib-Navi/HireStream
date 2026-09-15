const MAX_SLUG_LENGTH = 60;

export const slugify = (value) =>
  String(value)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH) || "item";

// Returns "acme", or "acme-2", "acme-3"... when the slug is already taken
export const generateUniqueSlug = async (Model, value) => {
  const base = slugify(value);
  let slug = base;
  let suffix = 1;
  while (await Model.exists({ slug })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
};

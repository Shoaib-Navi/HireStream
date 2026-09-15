// Escapes user input so it is matched literally inside a MongoDB $regex query.
export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

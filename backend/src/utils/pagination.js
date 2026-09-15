// page and limit come from validated query params (see paginationShape)
export const toPagination = ({ page = 1, limit = 12 } = {}) => ({
  page,
  limit,
  skip: (page - 1) * limit,
});

export const paginationMeta = ({ page, limit }, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

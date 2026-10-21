import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { cleanParams } from "@/lib/query";

const PAGE_SIZE = 20;

// Filter state for the admin lists: changing any filter goes back to page 1,
// and the search text is debounced before it reaches the API.
export const useAdminFilters = (initialFilters) => {
  const [filters, setFilters] = useState({ q: "", ...initialFilters, page: 1 });
  const debouncedSearch = useDebounce(filters.q, 300);

  const update = (patch) => setFilters((current) => ({ ...current, page: 1, ...patch }));

  return {
    filters,
    update,
    setPage: (page) => setFilters((current) => ({ ...current, page })),
    params: cleanParams({ ...filters, q: debouncedSearch, limit: PAGE_SIZE }),
  };
};

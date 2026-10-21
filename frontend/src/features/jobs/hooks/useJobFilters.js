import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { EMPLOYMENT_TYPES, JOB_SORT_OPTIONS, WORK_MODES } from "@/lib/constants";
import { cleanParams } from "@/lib/query";

const PAGE_SIZE = 12;

const readList = (searchParams, key, options) =>
  (searchParams.get(key) ?? "")
    .split(",")
    .filter((value) => options.some((option) => option.value === value));

// Job search filters live in the URL, so results can be shared, bookmarked and survive a refresh
export const useJobFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const sort = searchParams.get("sort");
    return {
      q: searchParams.get("q") ?? "",
      location: searchParams.get("location") ?? "",
      employmentType: readList(searchParams, "employmentType", EMPLOYMENT_TYPES),
      workMode: readList(searchParams, "workMode", WORK_MODES),
      experience: searchParams.get("experience") ?? "",
      salaryMin: searchParams.get("salaryMin") ?? "",
      sort: JOB_SORT_OPTIONS.some((option) => option.value === sort) ? sort : "newest",
      page: Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1),
    };
  }, [searchParams]);

  // Any change except paging goes back to page 1
  const updateFilters = useCallback(
    (changes) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(changes)) {
          const serialized = Array.isArray(value) ? value.join(",") : String(value ?? "");
          const isDefault = serialized === "" || (key === "sort" && serialized === "newest") || (key === "page" && serialized === "1");
          if (isDefault) next.delete(key);
          else next.set(key, serialized);
        }
        if (!("page" in changes)) next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => setSearchParams({}), [setSearchParams]);

  const apiParams = useMemo(
    () =>
      cleanParams({
        ...filters,
        employmentType: filters.employmentType.join(","),
        workMode: filters.workMode.join(","),
        limit: PAGE_SIZE,
      }),
    [filters],
  );

  const activeFilterCount =
    filters.employmentType.length + filters.workMode.length + (filters.experience ? 1 : 0) + (filters.salaryMin ? 1 : 0);

  return { filters, apiParams, updateFilters, clearFilters, activeFilterCount };
};

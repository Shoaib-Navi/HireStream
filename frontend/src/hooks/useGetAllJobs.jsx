import api from "@/lib/api";
import { setAllJobs } from "@/redux/jobSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

// Fetches public jobs, optionally filtered on the server by keyword
const useGetAllJobs = (keyword = "") => {
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    const fetchAllJobs = async () => {
      try {
        const res = await api.get("/job/get", {
          params: { keyword },
          signal: controller.signal,
        });
        dispatch(setAllJobs(res.data.jobs));
      } catch (error) {
        if (!controller.signal.aborted) console.error(error);
      }
    };
    fetchAllJobs();
    // a newer keyword cancels the older request, so results can't arrive out of order
    return () => controller.abort();
  }, [keyword, dispatch]);
};

export default useGetAllJobs;

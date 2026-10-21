import api from "@/lib/api";
import { setAllAppliedJobs } from "@/redux/jobSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAppliedJobs = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    const fetchAppliedJobs = async () => {
      try {
        const res = await api.get("/application/get", { signal: controller.signal });
        dispatch(setAllAppliedJobs(res.data.applications));
      } catch (error) {
        if (!controller.signal.aborted) console.error(error);
      }
    };
    fetchAppliedJobs();
    return () => controller.abort();
  }, [dispatch]);
};

export default useGetAppliedJobs;

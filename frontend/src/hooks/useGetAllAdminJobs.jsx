import api from "@/lib/api";
import { setAllAdminJobs } from "@/redux/jobSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllAdminJobs = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    const fetchAllAdminJobs = async () => {
      try {
        const res = await api.get("/job/getadminjobs", { signal: controller.signal });
        dispatch(setAllAdminJobs(res.data.jobs));
      } catch (error) {
        if (!controller.signal.aborted) console.error(error);
      }
    };
    fetchAllAdminJobs();
    return () => controller.abort();
  }, [dispatch]);
};

export default useGetAllAdminJobs;

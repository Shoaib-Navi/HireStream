import api from "@/lib/api";
import { setCompanies } from "@/redux/companySlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllCompanies = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/company/get", { signal: controller.signal });
        dispatch(setCompanies(res.data.companies));
      } catch (error) {
        if (!controller.signal.aborted) console.error(error);
      }
    };
    fetchCompanies();
    return () => controller.abort();
  }, [dispatch]);
};

export default useGetAllCompanies;

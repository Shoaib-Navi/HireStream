import api from "@/lib/api";
import { setSingleCompany } from "@/redux/companySlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const useGetCompanyById = (companyId) => {
  const dispatch = useDispatch();
  const [failedId, setFailedId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchSingleCompany = async () => {
      try {
        const res = await api.get(`/company/get/${companyId}`, { signal: controller.signal });
        dispatch(setSingleCompany(res.data.company));
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setFailedId(companyId);
      }
    };
    fetchSingleCompany();
    return () => controller.abort();
  }, [companyId, dispatch]);

  return { failed: failedId === companyId };
};

export default useGetCompanyById;

import React, { useEffect } from 'react'
import ApplicantsTable from './ApplicantsTable'
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';
import api, { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

const Applicants = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { applicants } = useSelector(store => store.application);
  // Ignore applicants left in the store from another job
  const job = applicants?._id === id ? applicants : null;

  useEffect(() => {
    const controller = new AbortController();
    const fetchAllApplicants = async () => {
      try {
        const res = await api.get(`/application/${id}/applicants`, { signal: controller.signal });
        dispatch(setAllApplicants(res.data.job));
      } catch (error) {
        if (!controller.signal.aborted) toast.error(getErrorMessage(error));
      }
    };
    fetchAllApplicants();
    return () => controller.abort();
  }, [id, dispatch]);

  return (
    <div className='max-w-7xl mx-auto px-4'>
      <h1 className='font-bold text-xl my-5'>
        Applicants {job?.applications?.length ?? 0}
        {job?.title && <span className='font-normal text-gray-500'> · {job.title}</span>}
      </h1>
      <ApplicantsTable job={job} />
    </div>
  )
}

export default Applicants

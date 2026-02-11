import { setCompanies} from '@/redux/companySlice'
import { setAllAdminJobs} from '@/redux/jobSlice'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'


const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();

    useEffect(()=>{
        const fetchAllJobs = async () => {
            try {
                const res = await axios.get(`${COMPANY_API_END_POINT}/getadminjobs`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setAllAdminJobs(res.data.jobs));
                    console.log(res.data.jobs);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllJobs();
    },[])
}

export default useGetAllAdminJobs
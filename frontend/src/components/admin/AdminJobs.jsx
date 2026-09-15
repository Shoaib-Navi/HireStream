import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("")
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input, dispatch])

  return (
    <div className='max-w-6xl mx-auto my-10 px-4'>
      <div className='flex items-center justify-between gap-3 my-5'>
        <Input
          className="w-fit"
          placeholder="Filter by name, role"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={() => navigate("/admin/jobs/create")}>Post Job</Button>
      </div>
      <AdminJobsTable />
    </div>
  )
}

export default AdminJobs

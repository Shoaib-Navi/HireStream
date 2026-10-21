import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { setSearchCompanyByText } from '@/redux/companySlice'

const Companies = () => {
  useGetAllCompanies();
  const [input, setInput] = useState("")
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchCompanyByText(input));
  }, [input, dispatch])

  return (
    <div className='max-w-6xl mx-auto my-10 px-4'>
      <div className='flex items-center justify-between gap-3 my-5'>
        <Input
          className="w-fit"
          placeholder="Filter by name"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={() => navigate("/admin/companies/create")}>New Company</Button>
      </div>
      <CompaniesTable />
    </div>
  )
}

export default Companies

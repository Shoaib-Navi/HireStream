import React, { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import api, { getErrorMessage } from '@/lib/api'

const FIELDS = [
  { name: "title", label: "Title", type: "text" },
  { name: "description", label: "Description", type: "text" },
  { name: "requirements", label: "Requirements (comma separated)", type: "text" },
  { name: "salary", label: "Salary (LPA)", type: "number", min: 0, step: "any" },
  { name: "location", label: "Location", type: "text" },
  { name: "jobType", label: "Job Type", type: "text" },
  { name: "experience", label: "Experience Level (years)", type: "number", min: 0, step: 1 },
  { name: "position", label: "No of Positions", type: "number", min: 1, step: 1 },
];

const PostJob = () => {
  useGetAllCompanies();
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "",
    experience: "",
    position: "",
    companyId: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { companies } = useSelector(store => store.company);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const selectChangeHandler = (companyId) => {
    setInput({ ...input, companyId });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/job/post", input);
      toast.success(res.data.message);
      navigate("/admin/jobs");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex items-center justify-center px-4 my-5'>
      <form onSubmit={submitHandler} className='p-8 w-full max-w-4xl border border-gray-200 shadow-lg rounded-md'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
          {FIELDS.map(({ name, label, type, min, step }) => (
            <div key={name}>
              <Label htmlFor={name}>{label}</Label>
              <Input
                id={name}
                type={type}
                name={name}
                min={min}
                step={step}
                value={input[name]}
                onChange={changeEventHandler}
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
              />
            </div>
          ))}
          {companies.length > 0 && (
            <div>
              <Label>Company</Label>
              <Select value={input.companyId} onValueChange={selectChangeHandler}>
                <SelectTrigger className="w-[180px] my-1">
                  <SelectValue placeholder="Select a Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {companies.map((company) => (
                      <SelectItem key={company._id} value={company._id}>{company.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {loading ? (
          <Button disabled className="w-full my-4"><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait</Button>
        ) : (
          <Button type="submit" disabled={companies.length === 0} className="w-full my-4">Post New Job</Button>
        )}
        {companies.length === 0 && (
          <p className='text-xs text-red-600 font-bold text-center my-3'>*Please register a company first, before posting a jobs</p>
        )}
      </form>
    </div>
  )
}

export default PostJob

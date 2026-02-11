import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import store from '@/redux/store'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, MoreHorizontal } from "lucide-react";

const AdminJobsTable = () => {
    const {companies, searchCompanyByText } = useSelector(store => store.company);
    const {allAdminJobs, searchJobByText} = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();

    useEffect(()=>{
      const filteredJobs = allAdminJobs.length >= 0 && allAdminJobs.filter((job)=>{
        if(!searchJobByText){
          return true;
        }
        return job?.name?.toLowerCase().includes(searchJobByText.toLowerCase())
      })
      setFilterJobs(filteredJobs);
    },[allAdminJobs,searchJobByText])
  return (
    <div>
      <Table>
        <TableCaption>A list of your recent posted jobs.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name </TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right ">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterJobs?.map((job) => (
            <tr>
              <TableCell>
                <Avatar>
                  <AvatarImage src={job.logo} />
                </Avatar>
              </TableCell>
              <TableCell>{job.name}</TableCell>
              <TableCell>{job.createdAt.split("T")[0]}</TableCell>
              <TableCell className="text-right cursor-pointer ">
                <Popover>
                  <PopoverTrigger className="cursor-pointer">
                    <MoreHorizontal />
                  </PopoverTrigger>
                  <PopoverContent className="w-32">
                    <div onClick={()=> navigate(`/admin/companies/${job._id}`)} className="flex items-center gap-2 w-fit cursor-pointer">
                      <Edit2 className="w-4" />
                      <span>Edit</span>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminJobsTable;

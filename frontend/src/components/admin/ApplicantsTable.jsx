import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import api, { getErrorMessage } from '@/lib/api';
import { setAllApplicants } from '@/redux/applicationSlice';

const shortlistingStatus = ["Accepted", "Rejected"];

const STATUS_STYLES = {
  accepted: 'bg-green-400',
  rejected: 'bg-red-400',
  pending: 'bg-gray-400',
};

const ApplicantsTable = ({ job }) => {
  const dispatch = useDispatch();
  const applications = job?.applications ?? [];

  const statusHandler = async (status, id) => {
    try {
      const res = await api.post(`/application/status/${id}/update`, { status });
      const updated = applications.map((application) =>
        application._id === id ? { ...application, status: res.data.application.status } : application
      );
      dispatch(setAllApplicants({ ...job, applications: updated }));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div>
      <Table>
        <TableCaption>A list of your recent applied user</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>FullName</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Applied On</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">No applicants yet.</TableCell>
            </TableRow>
          ) : (
            applications.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.applicant?.fullname}</TableCell>
                <TableCell>{item.applicant?.email}</TableCell>
                <TableCell>{item.applicant?.phoneNumber}</TableCell>
                <TableCell>
                  {item.applicant?.profile?.resume ? (
                    <a className="text-blue-600 cursor-pointer" href={item.applicant.profile.resume} target="_blank" rel="noopener noreferrer">
                      {item.applicant.profile.resumeOriginalName || "View resume"}
                    </a>
                  ) : (
                    <span>NA</span>
                  )}
                </TableCell>
                <TableCell>{item.createdAt?.split("T")[0]}</TableCell>
                <TableCell>
                  <Badge className={STATUS_STYLES[item.status] ?? STATUS_STYLES.pending}>
                    {item.status?.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Popover>
                    <PopoverTrigger className="cursor-pointer" aria-label="Change status">
                      <MoreHorizontal />
                    </PopoverTrigger>
                    <PopoverContent className="w-32">
                      {shortlistingStatus.map((status) => (
                        <button
                          type="button"
                          onClick={() => statusHandler(status, item._id)}
                          key={status}
                          className='flex w-fit items-center my-2 cursor-pointer'
                        >
                          {status}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default ApplicantsTable

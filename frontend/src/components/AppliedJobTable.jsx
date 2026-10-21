import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'

const STATUS_STYLES = {
  accepted: 'bg-green-400',
  rejected: 'bg-red-400',
  pending: 'bg-gray-400',
}

const AppliedJobTable = () => {
  const { allAppliedJobs } = useSelector(store => store.job)

  return (
    <div>
      <Table>
        <TableCaption>A list of your applied jobs.</TableCaption>
        <TableHeader>
          <TableRow className="text-medium">
            <TableHead>Date</TableHead>
            <TableHead>Job Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allAppliedJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="p-4 text-center text-gray-500">
                You haven't applied any job yet.
              </TableCell>
            </TableRow>
          ) : (
            allAppliedJobs.map((appliedJob) => (
              <TableRow key={appliedJob._id}>
                <TableCell className="p-4">{appliedJob.createdAt?.split("T")[0]}</TableCell>
                <TableCell className="p-4">{appliedJob.job?.title ?? "Job no longer available"}</TableCell>
                <TableCell className="p-4">{appliedJob.job?.company?.name}</TableCell>
                <TableCell className="text-right p-4">
                  <Badge className={STATUS_STYLES[appliedJob.status] ?? STATUS_STYLES.pending}>
                    {appliedJob.status?.toUpperCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default AppliedJobTable

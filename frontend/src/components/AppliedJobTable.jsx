import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'

const AppliedJobTable = () => {
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
            {
                [1,2,3,4].map((item,index)=>(
                    <TableRow className="">
                        <TableCell className="p-4">21-01-2026</TableCell>
                        <TableCell className="p-4">SDE-1</TableCell>
                        <TableCell className="p-4">Google</TableCell>
                        <TableCell className="text-right p-4"><Badge>Accepted</Badge></TableCell>
                    </TableRow>
                ))
            }
        </TableBody>
      </Table>
    </div>
  )
}

export default AppliedJobTable

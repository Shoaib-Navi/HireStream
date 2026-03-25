import React from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

const Job = ({ job }) => {
  const navigate = useNavigate();
  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (24 * 60 * 60 * 1000));
  };

  return (
    <div className="p-4 sm:p-5 rounded-md bg-white shadow-xl border border-gray-100 h-full flex flex-col">

      <div className="flex justify-between">
        <p className="text-xs sm:text-sm text-gray-500">
          {daysAgoFunction(job?.createdAt) == 0
            ? "Today"
            : `${daysAgoFunction(job?.createdAt)} days ago`}
        </p>
        <Button variant="outline" className="rounded-full" size="icon">
          <Bookmark />
        </Button>
      </div>

      <div className="flex items-center gap-2 my-2">
        <Button className="p-5 sm:p-6" variant="outline" size="icon">
          <Avatar>
            <AvatarImage src={job?.company?.logo} />
          </Avatar>
        </Button>
        <div>
          <h1 className="font-medium text-base sm:text-lg">
            {job?.company?.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">India</p>
        </div>
      </div>

      <div className="flex-1">
        <h1 className="font-bold text-base sm:text-lg my-2 line-clamp-2">
          {job?.title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
          {job?.description}
        </p>
      </div>

      <div className="flex items-center flex-wrap gap-2 mt-4">
        <Badge className={"text-blue-700 font-bold"} variant="ghost">
          {job?.position} Positions
        </Badge>
        <Badge className={"text-[#f83002] font-bold"} variant="ghost">
          {job?.jobType}
        </Badge>
        <Badge className={"text-[#7209b7] font-bold"} variant="ghost">
          {job?.salary}LPA
        </Badge>
      </div>

      <div className="flex items-center flex-wrap gap-3 mt-4">
        <Button
          variant="outline"
          className="text-xs sm:text-sm px-3 sm:px-4"
          onClick={() => navigate(`/description/${job?._id}`)}
        >
          Details
        </Button>
        <Button className="bg-[#7209b7] text-xs sm:text-sm px-3 sm:px-4">
          Save For Later
        </Button>
      </div>

    </div>
  );
};

export default Job;
import React, { useState } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAppliedJob";
import PageHero from "./shared/PageHero";

const Profile = () => {
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const skills = user?.profile?.skills ?? [];
  const resume = user?.profile?.resume;

  return (
    <div>
      <PageHero
        image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400"
        title="Your Career Profile"
        subtitle="Keep your profile updated to get matched with the best opportunities."
        btnText="Edit profile"
        btnLink="/profile"
        align="right"
      />

      <div className="max-w-6xl mx-auto  bg-[#fafafa] rounded-3xl border border-gray-100 p-10">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.profile?.profilePhoto} alt="profile" />
            </Avatar>
            <div>
              <h1 className="font-medium text-xl">{user?.fullname}</h1>
              <p>{user?.profile?.bio}</p>
            </div>
          </div>

          <Button
            className="text-right"
            variant="outline"
            onClick={() => setOpen(true)}
            aria-label="Edit profile"
          >
            <Pen />
          </Button>
        </div>
        <div className="my-5 ">
          <div className="flex items-center gap-3 my-2">
            <Mail />
            <span>{user?.email}</span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <Contact />
            <span>{user?.phoneNumber}</span>
          </div>
        </div>
        <div className="my-5">
          <h1>Skills</h1>
          <div className="flex flex-wrap items-center gap-1 mt-2">
            {skills.length > 0 ? (
              skills.map((item) => <Badge key={item}>{item}</Badge>)
            ) : (
              <span>NA</span>
            )}
          </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label className="text-md font-bold">Resume</Label>
          {resume ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={resume}
              className="text-blue-500 w-full hover:underline cursor-pointer"
            >
              {user?.profile?.resumeOriginalName || "View resume"}
            </a>
          ) : (
            <span>NA</span>
          )}
        </div>
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl">
        <h1 className="font-bold text-lg my-5">Applied Jobs</h1>
        <AppliedJobTable />
      </div>
      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;

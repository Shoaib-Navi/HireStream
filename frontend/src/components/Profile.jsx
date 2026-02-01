import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";

const skills = ["Html","Css","Javascript","ReactJs"];
const isResume = true;

const Profile = () => {
    const [open, setOpen] = useState(false);
    const {user} = useSelector(store =>store.auth)

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8 ">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src="https://media.istockphoto.com/id/1327592506/vector/default-avatar-photo-placeholder-icon-grey-profile-picture-business-man.jpg?s=612x612&w=0&k=20&c=BpR0FVaEa5F24GIw7K8nMWiiGmbb8qmhfkpXcp1dhQg="
                alt="profile"
              />
            </Avatar>
            <div>
              <h1 className="font-medium text-xl">{user?.fullname}</h1>
              <p>{user?.profile?.bio}</p>
            </div>
          </div>

          <Button className="text-right" variant="outline" onClick={()=>setOpen(true)}>
            <Pen />
          </Button>
        </div>
        <div className="my-5 ">
            <div className="flex items-center gap-3 my-2">
                <Mail/>
            <span>{user?.email}</span>
            </div>

            <div className="flex items-center gap-3 my-2">
                <Contact/>
            <span>{user?.phoneNumber}</span>
            </div>
        </div>
        <div className="my-5">
            <h1>{user?.profile?.skills}</h1>
            <div className="flex items-center gap-1 mt-2">
            {
                user?.profile?.skills.length != 0 ? user?.profile?.skills.map((item,index)=>(<Badge key={index} >{item}</Badge>) ):<span>NA</span>
            }
            </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label className="text-md font-bold" >Resume</Label>
            {
                isResume? <a target="blank" href="https://youtube.com" className="text-blue-500 w-full hover:underline cursor-pointer">shoaib_Resume</a>:<span>NA</span>
            }

        </div>
      </div>
        <div className="max-w-4xl mx-auto bg-white rounded-2xl">
            <h1 className="font-bold text-lg my-5">Applied Jobs</h1>
            <AppliedJobTable/>
        </div>
        <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;

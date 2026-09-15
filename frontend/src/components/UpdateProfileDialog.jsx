import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { useDispatch, useSelector } from "react-redux";
import api, { getErrorMessage } from "@/lib/api";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";

const FIELDS = [
  { name: "fullname", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phoneNumber", label: "Number", type: "tel" },
  { name: "bio", label: "Bio", type: "text" },
  { name: "skills", label: "Skills", type: "text", placeholder: "React, Node.js" },
];

// Mounted only while the dialog is open, so it always starts from the saved profile
const UpdateProfileForm = ({ onDone }) => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    fullname: user?.fullname ?? "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    bio: user?.profile?.bio ?? "",
    skills: user?.profile?.skills?.join(", ") ?? "",
    file: null,
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const fileChangeHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] ?? null });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("bio", input.bio);
    formData.append("skills", input.skills);
    // only send a resume when a new one was picked
    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      setLoading(true);
      const res = await api.post("/user/profile/update", formData);
      dispatch(setUser(res.data.user));
      toast.success(res.data.message);
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <div className="grid gap-4 py-4">
        {FIELDS.map(({ name, label, type, placeholder }) => (
          <div key={name} className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={name} className="text-right">{label}</Label>
            <Input
              id={name}
              name={name}
              type={type}
              value={input[name]}
              placeholder={placeholder}
              onChange={changeEventHandler}
              className="col-span-3"
            />
          </div>
        ))}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="file" className="text-right">Resume</Label>
          <Input
            id="file"
            name="file"
            type="file"
            accept="application/pdf"
            onChange={fileChangeHandler}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        {loading ? (
          <Button disabled className="w-full my-4">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
          </Button>
        ) : (
          <Button type="submit" className="w-full my-4">Update</Button>
        )}
      </DialogFooter>
    </form>
  );
};

const UpdateProfileDialog = ({ open, setOpen }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>
        <UpdateProfileForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;

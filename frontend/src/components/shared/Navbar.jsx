import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut, User2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { USER_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";

const Navbar = () => {
  //Getting data from Redux
  const { user } = useSelector((store) => store.auth); //“Redux me jo user save hai, usko access kar raha hoon.”
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //“Logout button click → backend logout API call → cookie clear → Redux user null → redirect → success message.”
  const logoutHandler = async () => {
    try {
      //calls backend logout API
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
      }); //Tumhara token cookie me stored hai
      if (res.data.success) {
        //Isliye withCredentials zaroori hai
        dispatch(setUser(null)); //clears user data from Redux
        navigate("/"); //redirects user to home page
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  return (
    <>
      <div className="bg-amber-200">
        <div className="flex items-center justify-between mx-auto max-w-7xl h-16">
          <div>
            <h1 className="text-2xl font-bold">
              Hire<span>Stream</span>
            </h1>
          </div>
          <div className="flex items-center gap-12 cursor-pointer">
            <ul className="flex font-medium items-center gap-5 ">
              {user && user.role == "recruiter" ? (
                <>
                  <li>
                    <Link to="/admin/companies">Companies</Link>
                  </li>
                  <li>
                    <Link to="/admin/jobs">Jobs</Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/jobs">Jobs</Link>
                  </li>
                  <li>
                    <Link to="/browse">Browse</Link>
                  </li>
                </>
              )}
            </ul>
            {!user ? (
              <div className="flex items-center gap-2 ">
                <Link to="/login">
                  <Button variant="outline" className="cursor-pointer">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#6A38c2] hover:bg-[#5b30a6] cursor-pointer">
                    SignUp
                  </Button>
                </Link>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user?.profile?.profilePhoto} />
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div>
                    <div className="flex gap-4 space-y-2">
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={user?.profile?.profilePhoto} />
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{user.fullname}</h4>
                        <p className="text-sm text-muted-foreground">
                          {user?.profile?.bio}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col text-gray-600 m-2">
                      <div className="flex w-fit items-center gap-2 cursor-pointer">
                       {
                         user && user.role === 'student' && (
                          <>
                          <User2 />
                           <Button variant="link">
                          <Link to="/profile">View Profile</Link>
                        </Button>
                        </>
                        )
                       }
                      </div>
                      <div className="flex w-fit items-center gap-2 cursor-pointer">
                        <LogOut />
                        <Button onClick={logoutHandler} variant="link">
                          <Link to="/logout">Logout</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

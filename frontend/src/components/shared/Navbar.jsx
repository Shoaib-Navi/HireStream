import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut, User2, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { USER_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";

const Navbar = () => {
  const { user }  = useSelector((store) => store.auth);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
        setMobileOpen(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const navLinks = user && user.role === "recruiter"
    ? [
        { label: "Companies", path: "/admin/companies" },
        { label: "Jobs",      path: "/admin/jobs"      },
      ]
    : [
        { label: "Home",   path: "/"       },
        { label: "Jobs",   path: "/jobs"   },
        { label: "Browse", path: "/browse" },
      ];

  return (
    <>
      {/* ── Main Navbar ── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4 sm:px-6">

          {/* Logo */}
          <Link to="/" className="flex items-center w-fit shrink-0">
            <span className="text-xl font-bold relative inline-block tracking-tight text-gray-900">
              HireStream
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#6a38c2] rounded-full" />
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <ul className="hidden md:flex items-center gap-1 font-medium text-sm">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.path}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Desktop Right Side ── */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#6a38c2] hover:bg-[#5b30a6] text-white text-sm font-semibold cursor-pointer rounded-lg px-5">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Avatar className="cursor-pointer h-10 w-10 ring-2 ring-[#6a38c2] ring-offset-2">
                    <AvatarImage src={user?.profile?.profilePhoto} />
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div>
                    <div className="flex gap-4 mb-3">
                      <Avatar className="cursor-pointer h-14 w-14 ring-2 ring-[#6a38c2]/30 ring-offset-2">
                        <AvatarImage src={user?.profile?.profilePhoto} />
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-sm">{user.fullname}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{user?.profile?.bio}</p>
                      </div>
                    </div>
                    <div className="flex flex-col text-gray-600 gap-1">
                      {user.role === "student" && (
                        <div className="flex items-center gap-2 cursor-pointer">
                          <User2 className="h-4 w-4" />
                          <Button variant="link" className="p-0 h-auto text-sm">
                            <Link to="/profile">View Profile</Link>
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 cursor-pointer">
                        <LogOut className="h-4 w-4" />
                        <Button onClick={logoutHandler} variant="link" className="p-0 h-auto text-sm">
                          Logout
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* ── Mobile Right Side ── */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <Avatar className="h-8 w-8 ring-2 ring-[#6a38c2] ring-offset-1 cursor-pointer">
                <AvatarImage src={user?.profile?.profilePhoto} />
              </Avatar>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen
                ? <X    className="h-5 w-5 text-gray-700" />
                : <Menu className="h-5 w-5 text-gray-700" />
              }
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/20"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-xl px-4 py-4 flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#6a38c2] transition-all"
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-gray-100 my-2" />

            {/* Auth or Profile */}
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full text-sm font-medium">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-[#6a38c2] hover:bg-[#5b30a6] text-white text-sm font-semibold">
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-1">
                  <Avatar className="h-10 w-10 ring-2 ring-[#6a38c2]/30">
                    <AvatarImage src={user?.profile?.profilePhoto} />
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.fullname}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{user?.profile?.bio}</p>
                  </div>
                </div>

                {/* View Profile */}
                {user.role === "student" && (
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <User2 className="h-4 w-4 text-[#6a38c2]" />
                    View Profile
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={logoutHandler}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all text-left w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
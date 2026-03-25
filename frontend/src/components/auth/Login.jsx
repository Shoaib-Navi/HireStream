import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Loader2, Mail, Lock, Briefcase, ArrowRight } from "lucide-react";

const Login = () => {
  const [input, setInput] = useState({ email: "", password: "", role: "" });
  const { loading, user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) =>
    setInput({ ...input, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Reset loading state on mount
   useEffect(() => {
     dispatch(setLoading(false));
   }, []);
   useEffect(() => {
     if (user) navigate("/");
   }, [user]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="min-h-[calc(100vh-64px)] flex">

        {/* ── Left visual panel (hidden on mobile) ── */}
        <div className="hidden lg:flex lg:w-1/2 bg-gray-950 relative overflow-hidden flex-col justify-between p-12">

          {/* Background grid pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{backgroundImage: "linear-gradient(#6a38c2 1px, transparent 1px), linear-gradient(90deg, #6a38c2 1px, transparent 1px)", backgroundSize: "40px 40px"}}
          />

          {/* Glow blobs */}
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-[#6a38c2]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-[#f83002]/10 blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10">
            <span className="text-white font-extrabold text-2xl tracking-tight relative inline-block">
              HireStream
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#6a38c2] rounded-full" />
            </span>
          </div>

          {/* Center content */}
          <div className="relative z-10 flex flex-col gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
                Your next career move<br />
                <span className="text-[#9b6dff]">starts right here.</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Join 1M+ professionals who found their dream jobs on HireStream. Sign in to continue your journey.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { num: "12K+", label: "Live Jobs" },
                { num: "1M+",  label: "Hired"     },
                { num: "500+", label: "Companies"  },
              ].map(({ num, label }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <p className="text-[#9b6dff] font-extrabold text-xl">{num}</p>
                  <p className="text-gray-500 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-gray-300 text-sm leading-relaxed italic">
                "Found my dream job at Google within a week. The platform is incredibly clean and the job quality is unmatched."
              </p>
              <div className="flex items-center gap-3 mt-4">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" className="h-8 w-8 rounded-full ring-2 ring-[#6a38c2]/30" alt="user" />
                <div>
                  <p className="text-white text-xs font-semibold">Priya Sharma</p>
                  <p className="text-gray-500 text-[10px]">Frontend Developer @ Google</p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-gray-600 text-xs">
            © {new Date().getFullYear()} HireStream. All rights reserved.
          </p>
        </div>

        {/* ── Right form panel ── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 py-10">
          <div className="w-full max-w-md">

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                Welcome back
              </h1>
              <p className="text-gray-500 text-sm">
                Sign in to your HireStream account to continue.
              </p>
            </div>

            <form onSubmit={submitHandler} className="flex flex-col gap-5">

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    value={input.email}
                    onChange={changeEventHandler}
                    placeholder="you@example.com"
                    className="pl-10 h-11 rounded-xl border-gray-200 focus:border-[#6a38c2] focus:ring-[#6a38c2]/20 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700">Password</Label>
                  <button type="button" className="text-xs text-[#6a38c2] hover:underline font-medium">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    name="password"
                    value={input.password}
                    onChange={changeEventHandler}
                    placeholder="Enter your password"
                    className="pl-10 h-11 rounded-xl border-gray-200 focus:border-[#6a38c2] focus:ring-[#6a38c2]/20 text-sm"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-gray-700">
                  I am signing in as
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {["student", "recruiter"].map((role) => (
                    <button
                      type="button"
                      key={role}
                      onClick={() => setInput({ ...input, role })}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-[1.5px] text-sm font-semibold transition-all ${
                        input.role === role
                          ? "border-[#6a38c2] bg-[#f3eeff] text-[#6a38c2]"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Briefcase className="h-4 w-4" />
                      {role === "student" ? "Job Seeker" : "Recruiter"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              {loading ? (
                <Button disabled className="w-full h-11 rounded-xl bg-[#6a38c2] text-white">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
                </Button>
              ) : (
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#6a38c2] hover:bg-[#5b2db0] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6a38c2]/20"
                >
                  Sign in <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">New to HireStream?</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Signup link */}
              <Link to="/signup">
                <button
                  type="button"
                  className="w-full h-11 rounded-xl border-[1.5px] border-[#e0d4fd] bg-white text-[#6a38c2] text-sm font-semibold hover:bg-[#f3eeff] transition-all"
                >
                  Create a free account
                </button>
              </Link>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
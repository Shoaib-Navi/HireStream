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
import { setLoading } from "@/redux/authSlice";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  Upload,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const Signup = () => {
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    file: "",
  });
  const { loading, user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) =>
    setInput({ ...input, [e.target.name]: e.target.value });
  const changeFileHandler = (e) =>
    setInput({ ...input, file: e.target.files?.[0] });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append("fullname", input.fullname);
      formData.append("email", input.email);
      formData.append("phoneNumber", input.phoneNumber);
      formData.append("password", input.password);
      formData.append("role", input.role);
      if (input.file) formData.append("file", input.file);

      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
        headers: { "content-type": "multipart/form-data" },
        withCredentials: true,
      });
      if (res.data.success) {
        navigate("/login");
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

  const perks = [
    "Access 12,000+ verified job listings",
    "One-click apply to top companies",
    "AI-powered job matching",
    "Track all your applications",
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="min-h-[calc(100vh-64px)] flex">
        {/* ── Left visual panel (hidden on mobile) ── */}
        <div className="hidden lg:flex lg:w-1/2 bg-gray-950 relative overflow-hidden flex-col justify-between p-12">
          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(#6a38c2 1px, transparent 1px), linear-gradient(90deg, #6a38c2 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-[#6a38c2]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-[#f83002]/10 blur-3xl pointer-events-none" />

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
                Land your dream job
                <br />
                <span className="text-[#9b6dff]">faster than ever.</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Create your free account and get matched with thousands of roles
                that fit your skills, location, and ambitions.
              </p>
            </div>

            {/* Perks list */}
            <div className="flex flex-col gap-3">
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#6a38c2]/20 border border-[#6a38c2]/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-[#9b6dff]" />
                  </div>
                  <p className="text-gray-300 text-sm">{perk}</p>
                </div>
              ))}
            </div>

            {/* Avatar stack */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[44, 32, 68, 75, 26].map((n) => (
                  <img
                    key={n}
                    src={`https://randomuser.me/api/portraits/${n % 2 === 0 ? "women" : "men"}/${n}.jpg`}
                    className="h-8 w-8 rounded-full ring-2 ring-gray-950 object-cover"
                    alt="user"
                  />
                ))}
              </div>
              <p className="text-gray-400 text-xs">
                <span className="text-white font-semibold">1M+</span>{" "}
                professionals already joined
              </p>
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
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                Create your account
              </h1>
              <p className="text-gray-500 text-sm">
                Free forever. No credit card required.
              </p>
            </div>

            <form onSubmit={submitHandler} className="flex flex-col gap-4">
              {/* Full name */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Full name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    name="fullname"
                    value={input.fullname}
                    onChange={changeEventHandler}
                    placeholder="Your full name"
                    className="pl-10 h-11 rounded-xl border-gray-200 text-sm"
                  />
                </div>
              </div>

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
                    className="pl-10 h-11 rounded-xl border-gray-200 text-sm"
                  />
                </div>
              </div>

              {/* Phone + Password row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Phone number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      name="phoneNumber"
                      value={input.phoneNumber}
                      onChange={changeEventHandler}
                      placeholder="98765 43210"
                      className="pl-10 h-11 rounded-xl border-gray-200 text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      name="password"
                      value={input.password}
                      onChange={changeEventHandler}
                      placeholder="Min. 8 characters"
                      className="pl-10 h-11 rounded-xl border-gray-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Role selector */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-gray-700">
                  I am joining as
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

              {/* Profile photo */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Profile photo{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] border-dashed border-gray-200 bg-gray-50 hover:border-[#6a38c2]/50 hover:bg-purple-50/30 transition-all cursor-pointer">
                  <Upload className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-500 truncate">
                    {input.file ? input.file.name : "Click to upload photo"}
                  </span>
                  <Input
                    accept="image/*"
                    type="file"
                    onChange={changeFileHandler}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Submit */}
              {loading ? (
                <Button
                  disabled
                  className="w-full h-11 rounded-xl bg-[#6a38c2] text-white mt-1"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  account...
                </Button>
              ) : (
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#6a38c2] hover:bg-[#5b2db0] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6a38c2]/20 mt-1"
                >
                  Create account <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {/* Login link */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">
                  Already have an account?
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <Link to="/login">
                <button
                  type="button"
                  className="w-full h-11 rounded-xl border-[1.5px] border-[#e0d4fd] bg-white text-[#6a38c2] text-sm font-semibold hover:bg-[#f3eeff] transition-all"
                >
                  Sign in instead
                </button>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

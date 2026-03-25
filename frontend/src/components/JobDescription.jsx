import React, { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useParams } from "react-router-dom";
import axios from "axios";
import { setSingleJob } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import PageHero from "./shared/PageHero";
import { MapPin, Briefcase, Clock, Banknote, Users, Calendar } from "lucide-react";

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 py-3 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-2 sm:w-44 shrink-0">
      {Icon && <Icon className="h-4 w-4 text-[#6a38c2] shrink-0" />}
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </div>
    <span className="text-sm text-gray-600 sm:pl-4">{value}</span>
  </div>
);

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job);
  const { user }      = useSelector((store) => store.auth);

  const isInitiallyApplied = singleJob?.applications?.some(
    (application) => application.applicant === user?._id
  ) || false;

  const [isApplied, setIsApplied] = useState(isInitiallyApplied);
  const params   = useParams();
  const jobId    = params.id;
  const dispatch = useDispatch();

  const applyJobHandler = async () => {
    try {
      const res = await axios.get(
        `${APPLICATION_API_END_POINT}/apply/${jobId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setIsApplied(true);
        const updatedSingleJob = {
          ...singleJob,
          applications: [...singleJob.applications, { applicant: user?._id }],
        };
        dispatch(setSingleJob(updatedSingleJob));
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Something went wrong";
      toast.error(message);
    }
  };

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(
            res.data.job.applications.some(
              (application) => application.applicant === user?._id
            )
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleJob();
  }, [jobId, dispatch, user?._id]);

  return (
    <>
      <Navbar />

      {/* Page Hero */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 max-w-6xl mx-auto">
        <PageHero
          image="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400"
          title="Job Details"
          subtitle="Everything you need to know about this role — requirements, salary, and how to apply."
          btnText="Browse more jobs"
          btnLink="/browse"
          align="left"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="bg-[#fafafa] rounded-2xl sm:rounded-3xl border border-gray-100 p-5 sm:p-8 md:p-10">

          {/* ── Header: Title + Apply button ── */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="font-bold text-xl sm:text-2xl text-gray-900 leading-tight">
                {singleJob?.title}
              </h1>
              {/* Company & Location pill */}
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#6a38c2]" />
                {singleJob?.location}
              </p>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge className="text-blue-700 font-semibold text-xs" variant="ghost">
                  {singleJob?.position} Positions
                </Badge>
                <Badge className="text-[#f83002] font-semibold text-xs" variant="ghost">
                  {singleJob?.jobType}
                </Badge>
                <Badge className="text-[#7209b7] font-semibold text-xs" variant="ghost">
                  {singleJob?.salary} LPA
                </Badge>
              </div>
            </div>

            {/* Apply button — full width on mobile */}
            <Button
              onClick={isApplied ? null : applyJobHandler}
              disabled={isApplied}
              className={`w-full sm:w-auto rounded-xl px-6 py-2.5 text-sm font-semibold shrink-0 ${
                isApplied
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#7209b7] hover:bg-[#641897]"
              }`}
            >
              {isApplied ? "Already Applied" : "Apply Now"}
            </Button>
          </div>

          {/* ── Description summary ── */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 mb-6">
            <p className="text-sm text-gray-600 leading-relaxed">
              {singleJob?.description}
            </p>
          </div>

          {/* ── Details grid ── */}
          <div className="bg-white rounded-xl border border-gray-100 px-4 sm:px-6 py-2">
            <DetailRow label="Role"             value={singleJob?.title}                    icon={Briefcase} />
            <DetailRow label="Location"         value={singleJob?.location}                 icon={MapPin}    />
            <DetailRow label="Experience"       value={`${singleJob?.experienceLevel} years`} icon={Clock}   />
            <DetailRow label="Salary"           value={`${singleJob?.salary} LPA`}          icon={Banknote}  />
            <DetailRow label="Total Applicants" value={singleJob?.applications?.length}     icon={Users}     />
            <DetailRow label="Posted Date"      value={singleJob?.createdAt?.split("T")[0]} icon={Calendar}  />
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default JobDescription;
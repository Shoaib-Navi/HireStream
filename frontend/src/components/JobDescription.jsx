import React, { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { setSingleJob } from "@/redux/jobSlice";
import api, { getErrorMessage } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
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
  const { id: jobId } = useParams();
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const [applying, setApplying] = useState(false);
  const [failedId, setFailedId] = useState(null);

  // Ignore a job left in the store from a previously viewed page
  const job         = singleJob?._id === jobId ? singleJob : null;
  const isApplied   = Boolean(job?.hasApplied);
  const isRecruiter = user?.role === "recruiter";

  const applyJobHandler = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/description/${jobId}` } });
      return;
    }
    try {
      setApplying(true);
      const res = await api.post(`/application/apply/${jobId}`);
      dispatch(setSingleJob({ ...job, hasApplied: true, applicantCount: (job?.applicantCount ?? 0) + 1 }));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setApplying(false);
    }
  };

  // Refetch when the user changes so "hasApplied" matches the logged-in account
  useEffect(() => {
    const controller = new AbortController();
    const fetchSingleJob = async () => {
      try {
        const res = await api.get(`/job/get/${jobId}`, { signal: controller.signal });
        dispatch(setSingleJob(res.data.job));
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setFailedId(jobId);
      }
    };
    fetchSingleJob();
    return () => controller.abort();
  }, [jobId, dispatch, user?._id]);

  return (
    <>
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
        {!job && failedId === jobId ? (
          <div className="bg-[#fafafa] rounded-2xl border border-gray-100 p-10 text-center">
            <h1 className="font-bold text-lg text-gray-900">Job not found</h1>
            <p className="text-sm text-gray-500 mt-1">This job may have been removed.</p>
          </div>
        ) : (
        <div className="bg-[#fafafa] rounded-2xl sm:rounded-3xl border border-gray-100 p-5 sm:p-8 md:p-10">

          {/* ── Header: Title + Apply button ── */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="font-bold text-xl sm:text-2xl text-gray-900 leading-tight">
                {job?.title}
              </h1>
              {/* Company & Location pill */}
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#6a38c2]" />
                {job?.location}
              </p>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge className="text-blue-700 font-semibold text-xs" variant="ghost">
                  {job?.position} Positions
                </Badge>
                <Badge className="text-[#f83002] font-semibold text-xs" variant="ghost">
                  {job?.jobType}
                </Badge>
                <Badge className="text-[#7209b7] font-semibold text-xs" variant="ghost">
                  {job?.salary} LPA
                </Badge>
              </div>
            </div>

            {/* Apply button — full width on mobile. Recruiters can't apply. */}
            {job && !isRecruiter && (
              <Button
                onClick={applyJobHandler}
                disabled={isApplied || applying}
                className={`w-full sm:w-auto rounded-xl px-6 py-2.5 text-sm font-semibold shrink-0 ${
                  isApplied
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#7209b7] hover:bg-[#641897]"
                }`}
              >
                {isApplied ? "Already Applied" : applying ? "Applying..." : "Apply Now"}
              </Button>
            )}
          </div>

          {/* ── Description summary ── */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 mb-6">
            <p className="text-sm text-gray-600 leading-relaxed">
              {job?.description}
            </p>
          </div>

          {/* ── Details grid ── */}
          <div className="bg-white rounded-xl border border-gray-100 px-4 sm:px-6 py-2">
            <DetailRow label="Role"             value={job?.title}                    icon={Briefcase} />
            <DetailRow label="Location"         value={job?.location}                 icon={MapPin}    />
            <DetailRow label="Experience"       value={job ? `${job.experienceLevel} years` : ""} icon={Clock} />
            <DetailRow label="Salary"           value={job ? `${job.salary} LPA` : ""} icon={Banknote} />
            <DetailRow label="Total Applicants" value={job?.applicantCount}           icon={Users}     />
            <DetailRow label="Posted Date"      value={job?.createdAt?.split("T")[0]} icon={Calendar}  />
          </div>

        </div>
        )}
      </div>
    </>
  );
};

export default JobDescription;

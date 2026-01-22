import axios from "axios";
import kConverter from "k-convert";
import { Clock, MapPin, User, CalendarDays, Video } from "lucide-react";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import Footer from "../components/Footer";
import JobCard from "../components/JobCard";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import ResumeSelectModal from "../components/ResumeSelectModal";
import { AppContext } from "../context/AppContext";

const ApplyJob = () => {
  const [jobData, setJobData] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [noSimilarJobs, setNoSimilarJobs] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [recommendedSlots, setRecommendedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customSlot, setCustomSlot] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const navigate = useNavigate();

  const { id } = useParams();
  const {
    jobs,
    jobLoading,
    backendUrl,
    userToken,
    userData,
    userApplication = [],
  } = useContext(AppContext);

  const fetchRecommendedSlots = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/interview/recommended-slots?jobId=${jobData?._id}`,
        { headers: { token: userToken } }
      );
      if (data.success) {
        setRecommendedSlots(data.slots);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const handleApplyClick = async () => {
    if (!userData) {
      navigate("/candidate-login");
      return toast.error("Please login to apply");
    }
    // Show resume selection modal instead of direct check
    setShowResumeModal(true);
  };

  const handleResumeSelected = async (resumePath) => {
    setSelectedResume(resumePath);
    setShowResumeModal(false);
    // Now fetch recommended slots and show slot modal
    await fetchRecommendedSlots();
    setShowSlotModal(true);
  };

  const applyJob = async (jobId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/user/apply-job`,
        { jobId, appliedResume: selectedResume },
        {
          headers: {
            token: userToken,
          },
        }
      );

      if (data.success) {
        return data;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      return null;
    }
  };

  const handleScheduleInterview = async () => {
    const slotTime = selectedSlot || (customSlot ? new Date(customSlot).getTime() : null);
    if (!slotTime) {
      return toast.error("Please select an interview slot");
    }

    setScheduling(true);
    try {
      // 1. Apply for the job first
      const applyResult = await applyJob(jobData?._id);
      if (!applyResult) {
        setScheduling(false);
        return;
      }

      // 2. Schedule the interview
      const { data } = await axios.post(
        `${backendUrl}/interview/schedule`,
        { applicationId: applyResult.applicationId, date: slotTime },
        { headers: { token: userToken } }
      );

      if (data.success) {
        toast.success("Application submitted & Interview scheduled!");
        setAlreadyApplied(true);
        setShowSlotModal(false);
      } else {
        toast.error(data.message || "Failed to schedule interview");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to schedule interview");
    } finally {
      setScheduling(false);
    }
  };

  useEffect(() => {
    if (jobs && id) {
      const data = jobs.find((job) => job._id === id);
      setJobData(data);
    }
  }, [id, jobs]);

  useEffect(() => {
    if (userApplication?.length > 0 && jobData) {
      const hasApplied = userApplication.some(
        (item) => item?.jobId?._id === jobData?._id
      );
      setAlreadyApplied(hasApplied);
    }
  }, [jobData, userApplication]);

  useEffect(() => {
    if (jobs && jobData) {
      const similarJobs = jobs.filter(
        (job) =>
          job._id !== jobData?._id &&
          job.companyId?.name === jobData?.companyId?.name
      );
      setNoSimilarJobs(similarJobs.length === 0);
    }
  }, [jobData, jobs]);

  if (jobLoading || !jobData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <section>
        <div className="flex flex-col lg:flex-row justify-between border border-blue-200 rounded-lg bg-blue-50 p-8 lg:p-12 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 flex-shrink-0 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
              <img
                src={
                  jobData?.companyId?.image
                    ? jobData.companyId.image.startsWith("http")
                      ? jobData.companyId.image
                      : `${backendUrl}${jobData.companyId.image}`
                    : assets.company_icon
                }
                alt={jobData?.companyId?.name || "Company logo"}
                className="w-12 h-12 object-cover"
                onError={(e) => {
                  e.target.src = assets.company_icon;
                }}
              />
            </div>
            <div className="flex-1 mb-6 md:mb-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-700 mb-3">
                {jobData?.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1.5">
                  <img src={assets.suitcase_icon} alt="Company" />
                  <span>{jobData?.companyId?.name || "Unknown Company"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={20} />
                  <span>{jobData?.level}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={19} />
                  <span>{jobData?.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={assets.money_icon} alt="Salary" />
                  <span>
                    CTC:{" "}
                    {jobData?.salary
                      ? kConverter.convertTo(jobData.salary)
                      : "Not disclosed"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="md:mt-6 flex flex-col items-start gap-2.5">
            <button
              className={`${alreadyApplied
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                } text-white font-medium py-2 px-6 rounded-md transition duration-200 shadow-sm `}
              onClick={handleApplyClick}
              disabled={alreadyApplied}
            >
              {alreadyApplied ? "Applied" : "Apply now"}
            </button>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Clock size={18} />
              <span>Posted {moment(jobData?.date).fromNow()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2 xl:w-2/3">
            <h1 className="text-2xl font-bold mb-6 text-gray-700">
              Job Description
            </h1>
            <div
              className="job-description text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: jobData?.description }}
            />
          </div>

          <div className="w-full lg:w-1/2 xl:w-1/3">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Other Jobs at{" "}
              <span className="text-blue-600">
                {jobData?.companyId?.name || "Company"}
              </span>
            </h2>
            <div className="space-y-4">
              {noSimilarJobs ? (
                <p className="text-gray-600">
                  No other jobs available at the moment.
                </p>
              ) : (
                jobs
                  .filter(
                    (job) =>
                      job._id !== jobData?._id &&
                      job.companyId?.name === jobData?.companyId?.name
                  )
                  .filter((job) => {
                    const appliedJobsId = new Set(
                      userApplication?.map((app) => app.jobId?._id)
                    );

                    return !appliedJobsId.has(job._id);
                  })
                  .reverse()
                  .slice(0, 3)
                  .map((job) => <JobCard job={job} key={job._id} />)
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />

      {/* Resume Selection Modal */}
      <ResumeSelectModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onSelect={handleResumeSelected}
        currentResume={userData?.resume}
      />

      {/* Interview Slot Selection Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <CalendarDays className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Schedule Interview</h2>
                <p className="text-sm text-gray-500">Select your preferred interview slot</p>
              </div>
            </div>

            {/* Recommended Slots */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recommended Slots</h3>
              <div className="space-y-2">
                {recommendedSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedSlot(slot); setCustomSlot(""); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${selectedSlot === slot
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <Video className="text-blue-500" size={18} />
                    <span className="text-sm text-gray-700">
                      {moment(slot).format("dddd, MMMM D, YYYY [at] h:mm A")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Slot */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Or choose your own time</h3>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customSlot}
                onChange={(e) => { setCustomSlot(e.target.value); setSelectedSlot(null); }}
                min={moment().add(1, 'day').format("YYYY-MM-DDTHH:mm")}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSlotModal(false)}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                disabled={scheduling}
                className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {scheduling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Confirm & Apply"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplyJob;

import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { LoaderCircle, Calendar, Clock, Video, User, Briefcase, FileText, Mail, ExternalLink, X, Info } from "lucide-react";

const ViewApplications = () => {
  const [viewApplicationsPageData, setViewApplicationsPageData] =
    useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Interview Related State
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const { backendUrl, companyToken } = useContext(AppContext);

  const fetchViewApplicationsPageData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/company/view-applications`,
        {},
        {
          headers: { token: companyToken },
        }
      );
      if (data?.success) {
        setViewApplicationsPageData(data.viewApplicationData || []);
      } else {
        toast.error(data?.message || "Failed to load applications.");
      }
    } catch (error) {
      console.error(error?.response?.data || "Error fetching applications");
      toast.error(
        error?.response?.data?.message || "Failed to fetch applications"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInterviews = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/interview/company-interviews`,
        { headers: { token: companyToken } }
      );
      if (data.success) {
        setInterviews(data.interviews);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdatingStatus(id);
    try {
      const { data } = await axios.post(
        `${backendUrl}/company/change-status`,
        { id, status },
        {
          headers: { token: companyToken },
        }
      );

      if (data?.success) {
        toast.success(data?.message || "Status updated successfully.");
        await fetchViewApplicationsPageData(); // Reload applications to reflect the update
      } else {
        toast.error(data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Error updating status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    document.title = "Superio - Job Portal | Dashboard";
  }, []);

  useEffect(() => {
    fetchViewApplicationsPageData();
    fetchInterviews();
  }, []);

  return (
    <section>
      {isLoading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <Loader />
        </div>
      ) : !viewApplicationsPageData || viewApplicationsPageData.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No applications found.
        </div>
      ) : (
        <div className="shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Job Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resume
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {viewApplicationsPageData.reverse().map((job, index) => (
                  <tr
                    key={job._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <img
                          src={
                            job?.userId?.image
                              ? job.userId.image.startsWith("http")
                                ? job.userId.image
                                : `${backendUrl}${job.userId.image}`
                              : assets.default_profile
                          }
                          alt={job?.userId?.name || "Applicant"}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                          onError={(e) =>
                            (e.target.src = assets.default_profile)
                          }
                        />
                        <div className="ml-3 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {job?.userId?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-[180px] truncate">
                      {job?.jobId?.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell">
                      {job?.jobId?.location}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {job?.date ? moment(job.date).format("ll") : "N/A"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {job?.userId?.resume ? (
                        <a
                          href={
                            job.userId.resume.startsWith("http")
                              ? job.userId.resume
                              : `${backendUrl}${job.userId.resume}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                          aria-label="View resume"
                        >
                          View
                          <img
                            src={assets.resume_download_icon}
                            alt=""
                            className="ml-1.5 h-3 w-3"
                          />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No resume</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {updatingStatus === job._id ? (
                        <div className="flex justify-center">
                          <LoaderCircle className="animate-spin h-5 w-5 text-gray-500" />
                        </div>
                      ) : job.status === "Pending" ? (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() =>
                              handleStatusUpdate(job._id, "Accepted")
                            }
                            className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded cursor-pointer"
                            disabled={updatingStatus === job._id}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(job._id, "Rejected")
                            }
                            className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded cursor-pointer"
                            disabled={updatingStatus === job._id}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${job.status === "Accepted" || job.status === "Interview Scheduled"
                            ? "text-green-800"
                            : "text-red-800"
                            }`}
                        >
                          {job.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {interviews.find(i => i.applicationId?._id === job._id || i.applicationId === job._id) ? (
                        <button
                          onClick={() => setSelectedInterview(interviews.find(i => i.applicationId?._id === job._id || i.applicationId === job._id))}
                          className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors flex items-center justify-center mx-auto"
                          title="View Interview Details"
                        >
                          <Info size={18} />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Interview Details Modal (Same as ManageJobs) */}
      {selectedInterview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-left">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
              <button
                onClick={() => setSelectedInterview(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <User size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedInterview.candidateId?.name || "Candidate Details"}</h2>
                  <p className="text-indigo-100 flex items-center gap-1 text-sm mt-1">
                    <Mail size={14} /> {selectedInterview.candidateId?.email || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Position</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-2">
                    <Briefcase size={16} className="text-indigo-500" />
                    {selectedInterview.jobId?.title || "Not Specified"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {selectedInterview.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest border-b pb-1">Schedule Details</h3>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar size={18} className="text-indigo-500" />
                    <span>{moment(selectedInterview.date).format("dddd, MMMM Do YYYY")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock size={18} className="text-indigo-500" />
                    <span>{moment(selectedInterview.date).format("h:mm A")}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest border-b pb-1">Interview Assets</h3>
                <div className="flex flex-col gap-2">
                  <a
                    href={selectedInterview.applicationId?.appliedResume || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-indigo-600" size={20} />
                      <span className="text-gray-800 font-medium">Candidate Resume</span>
                    </div>
                    <ExternalLink size={16} className="text-indigo-400 group-hover:text-indigo-600" />
                  </a>

                  {selectedInterview.meetLink && (
                    <a
                      href={selectedInterview.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Video className="text-purple-600" size={20} />
                        <span className="text-gray-800 font-medium">Meeting Link</span>
                      </div>
                      <ExternalLink size={16} className="text-purple-400 group-hover:text-purple-600" />
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>INTERVIEW ID: {selectedInterview._id}</span>
                <span>CREATED: {moment(selectedInterview.createdAt).format("YYYY-MM-DD")}</span>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 shadow-inner">
              <button
                onClick={() => setSelectedInterview(null)}
                className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ViewApplications;

import React, { useContext, useEffect, useRef, useState } from "react";
import moment from "moment";
import axios from "axios";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import { MoreVertical, Plus, X, Calendar, Clock, Video, User, LoaderCircle, Briefcase } from "lucide-react";
import LocationSelector from "../components/LocationSelector";
import { formatLocation, DEFAULT_COUNTRY } from "../utils/locationUtils";

const ManageJobs = () => {
  const [manageJobData, setManageJobData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeMenuJobId, setActiveMenuJobId] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);

  // Scheduled Interviews
  const [interviews, setInterviews] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);

  // Add Job Form State
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Programming");
  const [level, setLevel] = useState("Intermediate");
  const [salary, setSalary] = useState("");
  const [postingJob, setPostingJob] = useState(false);
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);
  const [countryName, setCountryName] = useState("Bangladesh");
  const [stateCode, setStateCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");

  const { backendUrl, companyToken } = useContext(AppContext);

  const fetchManageJobsData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/company/company/posted-jobs`,
        { headers: { token: companyToken } }
      );
      if (data.success) {
        setManageJobData(data.jobData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviews = async () => {
    setInterviewsLoading(true);
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
    } finally {
      setInterviewsLoading(false);
    }
  };

  const changeJobVisiblity = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/company/change-visiblity`,
        { id },
        { headers: { token: companyToken } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchManageJobsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const deleteJob = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/company/delete-job`,
        { id },
        { headers: { token: companyToken } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchManageJobsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete job");
    } finally {
      setActiveMenuJobId(null);
    }
  };

  const toggleMenu = (jobId) => {
    setActiveMenuJobId(activeMenuJobId === jobId ? null : jobId);
  };

  const postJob = async (e) => {
    e.preventDefault();
    setPostingJob(true);
    const location = formatLocation(city, stateName, countryName);

    try {
      const { data } = await axios.post(
        `${backendUrl}/company/post-job`,
        {
          title, description, category, location,
          country: countryName, countryCode,
          state: stateName, stateCode,
          city: city || stateName, level, salary,
        },
        { headers: { token: companyToken } }
      );

      if (data.success) {
        toast.success(data.message);
        resetForm();
        setIsAddJobModalOpen(false);
        fetchManageJobsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setPostingJob(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Programming");
    setLevel("Intermediate");
    setSalary("");
    setCountryCode(DEFAULT_COUNTRY);
    setCountryName("Bangladesh");
    setStateCode("");
    setStateName("");
    setCity("");
    if (quillRef.current) {
      quillRef.current.root.innerHTML = "";
    }
  };

  // Initialize Quill when modal opens
  useEffect(() => {
    if (isAddJobModalOpen && !quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Write job description here...",
      });
      quillRef.current.on("text-change", () => {
        const html = editorRef.current.querySelector(".ql-editor").innerHTML;
        setDescription(html);
      });
    }
  }, [isAddJobModalOpen]);

  // Countdown timer for interviews
  const getCountdown = (timestamp) => {
    const now = Date.now();
    const diff = timestamp - now;

    if (diff <= 0) return { text: "Started", isNow: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { text: `${days}d ${hours}h`, isNow: false };
    if (hours > 0) return { text: `${hours}h ${minutes}m`, isNow: false };
    return { text: `${minutes}m`, isNow: false, isSoon: minutes < 30 };
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".action-menu-container")) {
        setActiveMenuJobId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchManageJobsData();
    fetchInterviews();
  }, []);

  useEffect(() => {
    document.title = "Superio - Job Portal | Dashboard";
  }, []);

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setInterviews(prev => [...prev]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const upcomingInterviews = interviews.filter(i => i.date > Date.now() && i.status === "Scheduled");

  return (
    <section className="space-y-6">
      {/* Header with Add Job Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manage Jobs</h1>
        <button
          onClick={() => setIsAddJobModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Add Job
        </button>
      </div>

      {/* Scheduled Interviews Section */}
      {upcomingInterviews.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-indigo-600" size={22} />
            <h2 className="text-lg font-semibold text-gray-800">
              Scheduled Interviews ({upcomingInterviews.length})
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {upcomingInterviews.slice(0, 6).map((interview) => {
              const countdown = getCountdown(interview.date);
              return (
                <div
                  key={interview._id}
                  className={`bg-white rounded-lg p-4 border shadow-sm ${countdown.isSoon ? "border-orange-300" : "border-gray-200"
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User size={18} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {interview.candidateId?.name || "Candidate"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {interview.jobId?.title || "Position"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${countdown.isNow
                          ? "bg-green-100 text-green-700"
                          : countdown.isSoon
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {countdown.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {moment(interview.date).format("MMM D, YYYY")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {moment(interview.date).format("h:mm A")}
                    </span>
                  </div>
                  {interview.meetLink && (
                    <a
                      href={interview.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                    >
                      <Video size={14} />
                      Join Meeting
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Jobs Table */}
      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <Loader />
        </div>
      ) : !manageJobData || manageJobData.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No jobs posted yet</h3>
          <p className="text-gray-500 mb-6">Start by adding your first job posting</p>
          <button
            onClick={() => setIsAddJobModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Add Your First Job
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
          <div className="p-4 bg-white border-b border-gray-200 flex justify-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show Deleted Jobs</span>
            </label>
          </div>
          <table className="w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Applicants</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {manageJobData
                .filter((job) => (showDeleted ? job.isDeleted : !job.isDeleted))
                .reverse()
                .map((job, index) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">{job.title}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{job.location}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{moment(job.date).format("ll")}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-medium">
                        {job.applicants || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <input
                        onChange={() => changeJobVisiblity(job._id)}
                        type="checkbox"
                        checked={job.visible}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center relative action-menu-container">
                      <button
                        onClick={() => toggleMenu(job._id)}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical size={20} />
                      </button>
                      {activeMenuJobId === job._id && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                          {!job.isDeleted && (
                            <button
                              onClick={() => deleteJob(job._id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                            >
                              Delete
                            </button>
                          )}
                          <button
                            onClick={() => setActiveMenuJobId(null)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Job Modal */}
      {isAddJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-800">Add New Job</h2>
              <button
                onClick={() => { setIsAddJobModalOpen(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={postJob} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior React Developer"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                <div ref={editorRef} className="min-h-[120px] border border-gray-300 rounded-lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Programming">Programming</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Designing">Designing</option>
                    <option value="Networking">Networking</option>
                    <option value="Management">Management</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary *</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <LocationSelector
                    selectedCountry={countryCode}
                    selectedState={stateCode}
                    selectedCity={city}
                    onCountryChange={(code, name) => { setCountryCode(code); setCountryName(name); }}
                    onStateChange={(code, name) => { setStateCode(code); setStateName(name); }}
                    onCityChange={setCity}
                    showLabels={false}
                    required={true}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setIsAddJobModalOpen(false); resetForm(); }}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingJob}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {postingJob ? <LoaderCircle className="animate-spin" size={18} /> : <Plus size={18} />}
                  {postingJob ? "Adding..." : "Add Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ManageJobs;

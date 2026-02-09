import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import moment from "moment";
import {
    Calendar,
    Clock,
    Video,
    Briefcase,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Upload,
    Eye,
    FileText,
    LoaderCircle
} from "lucide-react";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";

const ScheduledInterviews = () => {
    const {
        backendUrl,
        userToken,
        isLogin,
        userData,
        fetchUserData,
        userApplication,
        applicationsLoading,
        fetchUserApplication
    } = useContext(AppContext);

    const [interviews, setInterviews] = useState([]);
    const [interviewsLoading, setInterviewsLoading] = useState(true);

    // Resume upload state
    const [isEdit, setIsEdit] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeLoading, setResumeLoading] = useState(false);

    const fetchInterviews = async () => {
        setInterviewsLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/interview/my-interviews`, {
                headers: { token: userToken },
            });
            if (data.success) {
                setInterviews(data.interviews);
            }
        } catch (error) {
            console.error("Error fetching interviews:", error);
        } finally {
            setInterviewsLoading(false);
        }
    };

    const handleResumeSave = async () => {
        if (!resumeFile) {
            toast.error("Please select a resume file");
            return;
        }

        setResumeLoading(true);
        try {
            const formData = new FormData();
            formData.append("resume", resumeFile);

            const { data } = await axios.post(
                `${backendUrl}/user/upload-resume`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        token: userToken,
                    },
                }
            );

            if (data.success) {
                toast.success(data.message);
                setIsEdit(false);
                fetchUserData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Resume upload error:", error);
            toast.error(error?.response?.data?.message || "Resume upload failed");
        } finally {
            setResumeLoading(false);
        }
    };

    useEffect(() => {
        if (userToken) {
            fetchInterviews();
            fetchUserApplication();
        }
    }, [userToken]);

    // Update every minute to refresh countdown/status
    useEffect(() => {
        const interval = setInterval(() => {
            setInterviews(prev => [...prev]);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const getStatus = (timestamp) => {
        const now = Date.now();
        const diff = timestamp - now;
        const isPast = diff < 0;

        // An interview is considered "Expired" if it's more than 2 hours past its start time
        const isExpired = diff < -(2 * 60 * 60 * 1000);

        if (isExpired) return { label: "Expired", color: "text-red-500 bg-red-50", icon: <AlertCircle size={14} /> };
        if (isPast) return { label: "In Progress / Past", color: "text-orange-500 bg-orange-50", icon: <Clock size={14} /> };

        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes < 30) return { label: "Starting Soon", color: "text-green-600 bg-green-50 animate-pulse", icon: <Video size={14} /> };

        return { label: "Scheduled", color: "text-blue-600 bg-blue-50", icon: <Calendar size={14} /> };
    };

    const upcomingInterviews = interviews.filter(i => i.date > Date.now() - (2 * 60 * 60 * 1000) && i.status === "Scheduled");
    const pastInterviews = interviews.filter(i => i.date <= Date.now() - (2 * 60 * 60 * 1000) || i.status === "Completed");

    if (!isLogin) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500 text-lg">Please login to view your dashboard.</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                            <p className="text-gray-600 mt-1">Manage your resume, applications, and scheduled interviews.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</span>
                                <span className="text-xl font-bold text-blue-600">{userApplication?.length || 0}</span>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Interviews</span>
                                <span className="text-xl font-bold text-indigo-600">{interviews.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Resume Section */}
                        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="text-blue-600" size={20} />
                                <h2 className="text-lg font-bold text-gray-800">Your Resume</h2>
                            </div>

                            {isEdit ? (
                                <div className="flex items-center flex-wrap gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <div className="flex-grow">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="file"
                                                hidden
                                                accept="application/pdf"
                                                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                                            />
                                            <div className="bg-white border-2 border-dashed border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3 group-hover:border-blue-400 transition-colors w-full">
                                                <Upload className="text-blue-500" size={20} />
                                                <span className="text-gray-700 font-medium">
                                                    {resumeFile ? resumeFile.name : "Choose a PDF file..."}
                                                </span>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setIsEdit(false); setResumeFile(null); }}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={!resumeFile || resumeLoading}
                                            onClick={handleResumeSave}
                                            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold transition-all ${!resumeFile || resumeLoading
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                                }`}
                                        >
                                            {resumeLoading ? (
                                                <>
                                                    <LoaderCircle className="animate-spin w-4 h-4" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                "Save Resume"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
                                            <FileText className="text-gray-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Current Resume</p>
                                            <p className="text-xs text-gray-500">
                                                {userData?.resume ? "Last updated recently" : "No resume uploaded yet"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {userData?.resume && (
                                            <a
                                                href={userData.resume}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                                            >
                                                <Eye size={16} />
                                                View
                                            </a>
                                        )}
                                        <button
                                            onClick={() => setIsEdit(true)}
                                            className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            <Upload size={16} />
                                            {userData?.resume ? "Update" : "Upload"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>


                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <h2 className="text-xl font-bold text-gray-800">Upcoming Interviews</h2>
                                </div>
                                <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                    Live Updates Every Minute
                                </div>
                            </div>

                            {applicationsLoading ? (
                                <div className="py-10 flex justify-center"><Loader /></div>
                            ) : !userApplication || userApplication.length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
                                    <p className="text-gray-500">You haven't applied for any jobs yet.</p>
                                    <a href="/all-jobs/all" className="text-blue-600 font-bold mt-2 inline-block hover:underline">Browse Jobs</a>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <tr>
                                                    <th className="px-6 py-5">Company & Position</th>
                                                    <th className="px-6 py-5 hidden md:table-cell">Status</th>
                                                    <th className="px-6 py-5">Schedule</th>
                                                    <th className="px-6 py-5">AI Interview Window</th>
                                                    <th className="px-6 py-5 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {[...userApplication].reverse().map((job) => {
                                                    const interview = interviews.find(i => i.applicationId === job._id);
                                                    const isScheduled = !!interview;
                                                    const now = Date.now();
                                                    const diff = isScheduled ? interview.date - now : null;
                                                    const isUpcoming = isScheduled && diff > -(2 * 60 * 60 * 1000);

                                                    if (isScheduled && !isUpcoming) return null;

                                                    return (
                                                        <tr key={job._id} className="hover:bg-blue-50/20 transition-colors group">
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100 group-hover:scale-110 transition-transform shadow-sm">
                                                                        <img
                                                                            src={job.companyId?.image || assets.default_company}
                                                                            className="w-7 h-7 object-contain"
                                                                            alt="Logo"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-gray-900 leading-tight">{job.jobId?.title}</p>
                                                                        <p className="text-[11px] text-gray-500 font-medium">{job.companyId?.name || "Unknown"}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 hidden md:table-cell">
                                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase ${job.status === "Pending" ? "bg-blue-50 text-blue-600" :
                                                                    job.status === "Accepted" ? "bg-green-50 text-green-600" :
                                                                        "bg-red-50 text-red-600"
                                                                    }`}>
                                                                    {job.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                {isScheduled ? (
                                                                    <div className="flex flex-col">
                                                                        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-tight">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                                                            AI Interview
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-400 font-medium">Available for 3 days</div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-gray-300 italic font-medium">Not Scheduled</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                {isScheduled ? (
                                                                    <div className="flex flex-col">
                                                                        <span className={`text-xs font-bold text-orange-600`}>
                                                                            Expires {moment(interview.date).add(3, 'days').fromNow()}
                                                                        </span>
                                                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                                            Deadline: {moment(interview.date).add(3, 'days').format("MMM D, h:mm A")}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-gray-300 font-medium">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-5 text-right">
                                                                {isScheduled ? (
                                                                    <Link
                                                                        to={`/interview-session/${interview._id}`}
                                                                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm bg-blue-600 hover:bg-blue-700 text-white`}
                                                                    >
                                                                        <Video size={16} />
                                                                        Join Interview
                                                                    </Link>
                                                                ) : (
                                                                    <button disabled className="px-5 py-2.5 rounded-lg text-xs font-bold bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100">
                                                                        Interview Pending
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Past Interviews Section */}
                        {pastInterviews.length > 0 && (
                            <section className="opacity-75 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all">
                                <div className="flex items-center gap-2 mb-6 text-gray-500">
                                    <CheckCircle2 size={20} />
                                    <h2 className="text-xl font-bold">Past Interview History</h2>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company & Position</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {pastInterviews.map((interview) => (
                                                    <tr key={interview._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                                                    <Briefcase className="text-gray-400" size={16} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">{interview.jobId?.title || "Job Position"}</p>
                                                                    <p className="text-xs text-gray-500">{interview.recruiterId?.name || "Company"}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-700">{moment(interview.date).format("MMM D, YYYY")}</p>
                                                            <p className="text-xs text-gray-500 font-medium">{moment(interview.date).format("h:mm A")}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                                <CheckCircle2 size={12} />
                                                                {interview.date < Date.now() ? "Completed" : "Scheduled"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-bold">
                                                                View History
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main >
            <Footer />
        </div >
    );
};

export default ScheduledInterviews;

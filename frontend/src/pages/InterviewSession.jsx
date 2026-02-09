import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { App } from "@/components/app/app";
import { APP_CONFIG_DEFAULTS } from "@/app-config";
import { ThemeProvider } from "@/components/app/theme-provider";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import Loader from "../components/Loader";
import { Briefcase, User, Info, AlertCircle } from "lucide-react";

const InterviewSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, userToken } = useContext(AppContext);
    const [interviewData, setInterviewData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviewDetails = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/interview/llm-info/${id}`, {
                    headers: { token: userToken }
                });
                if (data.success) {
                    setInterviewData(data.interviewDetail);
                } else {
                    console.error("Failed to fetch interview details");
                }
            } catch (error) {
                console.error("Error fetching interview details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id && userToken) {
            fetchInterviewDetails();
        }
    }, [id, userToken, backendUrl]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader />
            </div>
        );
    }

    if (!interviewData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Interview Session Not Found</h1>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                    We couldn't retrieve the details for this interview session. It might have expired or you may not have authorization.
                </p>
                <button
                    onClick={() => navigate('/scheduled-interviews')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const interviewConfig = {
        ...APP_CONFIG_DEFAULTS,
        pageTitle: "Official AI interview Session",
        pageDescription: interviewData
            ? `Interview for ${interviewData?.job?.title} at ${interviewData?.job?.location}`
            : "Live AI Interview Session",
        supportsChatInput: true,
        supportsVideoInput: false,
        interviewId: id, // Critical: pass the interviewId to the agent
        candidateName: interviewData?.candidate?.name, // Personalization
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Interview Header Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                <Briefcase className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{interviewData.job.title}</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <span className="font-semibold text-indigo-600 uppercase tracking-wider text-xs bg-indigo-50 px-2 py-0.5 rounded">Real Interview</span>
                                    <span>•</span>
                                    <span>AI Assistant Recruiting</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <User className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">Candidate</p>
                                <p className="text-sm font-bold text-gray-800">{interviewData.candidate.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Side Info Panel */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Info size={16} className="text-indigo-500" />
                                    Interview Scope
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Knowledge Areas</p>
                                        <p className="text-sm text-gray-700 leading-relaxed italic">
                                            The AI will assess your background in **{interviewData.job.title}**
                                            relative to your experience listed in your resume.
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-2">Instructions</p>
                                        <ul className="text-xs text-gray-600 space-y-2">
                                            <li className="flex gap-2">
                                                <span className="text-indigo-500 font-bold">1.</span>
                                                Ensure you are in a quiet environment.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-indigo-500 font-bold">2.</span>
                                                Click "Start Call" below to begin.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-indigo-500 font-bold">3.</span>
                                                Be concise and articulate your answers.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="font-bold mb-2">AI-Powered Evaluation</h3>
                                    <p className="text-xs text-indigo-100 leading-relaxed">
                                        Our agent automatically parses your resume and the job description to tailor every question specifically to you.
                                    </p>
                                </div>
                                <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                                    <Briefcase size={120} />
                                </div>
                            </div>
                        </div>

                        {/* Interview Interface */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col relative">
                                <ThemeProvider
                                    attribute="class"
                                    defaultTheme="light"
                                    enableSystem
                                    disableTransitionOnChange
                                >
                                    <App appConfig={interviewConfig} />
                                </ThemeProvider>

                                {/* Overlay status */}
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-gray-100 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Live Session</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default InterviewSession;

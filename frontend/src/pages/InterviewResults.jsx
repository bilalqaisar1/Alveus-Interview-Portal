import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import {
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Star,
    MessageSquare,
    Target,
    ThumbsUp,
    TrendingUp,
    Clock,
    Briefcase,
    FileText
} from "lucide-react";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const InterviewResults = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, userToken, companyToken } = useContext(AppContext);
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = userToken || companyToken;

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/interview/llm-info/${id}`, {
                    headers: { token }
                });
                console.log("Interview Detail Response:", data);
                if (data.success) {
                    setInterview(data.interviewDetail);
                }
            } catch (error) {
                console.error("Error fetching results:", error);
                toast.error("Failed to load interview results");
            } finally {
                setLoading(false);
            }
        };

        if (id && token) {
            fetchResults();
        }
    }, [id, token]);

    // Check if we have evaluation in interview object. 
    // Wait, the backend view I added for LLM doesn't include the 'evaluation' field yet.
    // I should update getInterviewLLMDetail to include it.

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

    if (!interview || !interview.evaluation) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-outfit">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center">
                    <AlertCircle size={64} className="text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">No Evaluation Found</h2>
                    <p className="text-gray-500 mt-2">This interview may not have been completed yet or is still being processed.</p>
                    <button onClick={() => navigate(-1)} className="mt-6 text-blue-600 font-bold flex items-center gap-2">
                        <ArrowLeft size={20} /> Back
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const { evaluation, evaluationAt } = interview || {};
    const {
        ratings = {},
        summary = "No summary available.",
        jobDescriptionMatch = { matchedKeywords: [], matchScore: 0 },
        recommendation = { decision: "Evaluated", rational: "No rational provided.", nextStepAdvice: "No advice provided." },
        sessionMetadata = { durationFormatted: "N/A", totalTokens: 0, sentimentTrend: "Neutral", transcriptSummary: "No transcript summary." }
    } = evaluation || {};

    const RatingCard = ({ icon: Icon, label, score = 0, colorClass = "blue" }) => (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl bg-blue-50 text-blue-600`}>
                    <Icon size={20} />
                </div>
                <span className={`text-lg font-black text-blue-600`}>{score}%</span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-blue-500 transition-all duration-1000`}
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50 font-outfit">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Breadcrumbs & Back */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>

                    {/* Header Card */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-blue-500/5 border border-white relative overflow-hidden mb-8">
                        <div className="absolute top-0 right-0 p-8">
                            <div className={`px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-sm ${recommendation?.decision === 'Strong Hire' ? 'bg-green-500 text-white' :
                                recommendation?.decision === 'Hire' ? 'bg-blue-500 text-white' :
                                    'bg-gray-800 text-white'
                                }`}>
                                {recommendation?.decision || 'Evaluated'}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <Star size={32} fill="white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">AI Interview Assessment</h1>
                                    <p className="text-gray-500 font-medium">Detailed performance report for the {interview.job?.title} position.</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock size={16} className="text-gray-400" />
                                    <span className="text-gray-500 font-bold uppercase tracking-tight">Duration:</span>
                                    <span className="text-gray-900 font-black">{sessionMetadata?.durationFormatted}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <TrendingUp size={16} className="text-gray-400" />
                                    <span className="text-gray-500 font-bold uppercase tracking-tight">Sentiment:</span>
                                    <span className="text-green-600 font-black tracking-tight">{sessionMetadata?.sentimentTrend}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm ml-auto">
                                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Evaluated on {new Date(evaluationAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left: Ratings & Metrics */}
                        <div className="lg:col-span-1 space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-2">Core Metrics</h3>
                            <div className="grid gap-4">
                                <RatingCard icon={Star} label="Overall Fit" score={ratings?.overallScore} />
                                <RatingCard icon={Target} label="Technical Depth" score={ratings?.technicalKnowledge} />
                                <RatingCard icon={MessageSquare} label="Communication" score={ratings?.communicationSkills} />
                                <RatingCard icon={ThumbsUp} label="Problem Solving" score={ratings?.problemSolving} />
                            </div>

                            {/* Job Match Card */}
                            <div className="bg-gray-900 p-6 rounded-[2rem] text-white shadow-xl shadow-gray-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <Briefcase size={20} className="text-blue-400" />
                                    <h4 className="font-bold tracking-tight">JD Keywords Match</h4>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {jobDescriptionMatch?.matchedKeywords?.map(kw => (
                                        <span key={kw} className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Match Score</span>
                                    <span className="text-2xl font-black text-blue-400">{jobDescriptionMatch?.matchScore}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Summary & Detail */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <MessageSquare className="text-blue-600" size={24} />
                                    Executive Summary
                                </h3>
                                <p className="text-gray-600 leading-[1.8] text-lg font-medium italic mb-8 border-l-4 border-blue-500 pl-6 bg-blue-50/30 py-4 rounded-r-2xl">
                                    "{summary}"
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">AI Recommendation Logic</h4>
                                        <p className="text-gray-700 font-medium leading-relaxed bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                            {recommendation?.rational}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Next Action</h4>
                                        <div className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded-xl border border-green-100">
                                            <CheckCircle2 size={20} />
                                            <span className="font-bold">{recommendation?.nextStepAdvice}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <FileText className="text-indigo-600" size={24} />
                                    Session Transcript Summary
                                </h3>
                                <div className="text-gray-600 leading-loose font-medium relative">
                                    {sessionMetadata?.transcriptSummary}
                                    <div className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        Tokens Processed: {sessionMetadata?.totalTokens}
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

export default InterviewResults;

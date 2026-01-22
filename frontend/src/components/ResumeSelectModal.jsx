import React, { useState, useRef, useContext } from "react";
import { FileText, Upload, Check, X, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AppContext } from "../context/AppContext";

const ResumeSelectModal = ({ isOpen, onClose, onSelect, currentResume }) => {
    const [selectedOption, setSelectedOption] = useState(currentResume ? "existing" : "upload");
    const [uploading, setUploading] = useState(false);
    const [newResumeFile, setNewResumeFile] = useState(null);
    const fileInputRef = useRef(null);
    const { backendUrl, userToken, setUserData } = useContext(AppContext);

    if (!isOpen) return null;

    const getResumeFileName = (resumePath) => {
        if (!resumePath) return "No resume";
        const parts = resumePath.split("/");
        return parts[parts.length - 1];
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") {
                toast.error("Please upload a PDF file");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }
            setNewResumeFile(file);
            setSelectedOption("upload");
        }
    };

    const handleContinue = async () => {
        if (selectedOption === "existing" && currentResume) {
            onSelect(currentResume);
        } else if (selectedOption === "upload" && newResumeFile) {
            setUploading(true);
            try {
                const formData = new FormData();
                formData.append("resume", newResumeFile);

                const { data } = await axios.post(
                    `${backendUrl}/user/upload-resume`,
                    formData,
                    {
                        headers: {
                            token: userToken,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                if (data.success) {
                    toast.success("Resume uploaded successfully");
                    setUserData((prev) => ({ ...prev, resume: data.resumeUrl }));
                    onSelect(data.resumeUrl);
                } else {
                    toast.error(data.message || "Failed to upload resume");
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || "Failed to upload resume");
            } finally {
                setUploading(false);
            }
        } else if (!currentResume && !newResumeFile) {
            toast.error("Please upload a resume to continue");
        } else {
            toast.error("Please select a resume option");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <FileText className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Select Resume</h2>
                            <p className="text-sm text-gray-500">Choose which resume to use for this application</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Resume Options */}
                <div className="space-y-3 mb-6">
                    {/* Existing Resume Option */}
                    {currentResume && (
                        <button
                            onClick={() => setSelectedOption("existing")}
                            className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition text-left ${selectedOption === "existing"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedOption === "existing" ? "bg-blue-500" : "bg-gray-200"
                                }`}>
                                {selectedOption === "existing" ? (
                                    <Check size={20} className="text-white" />
                                ) : (
                                    <FileText size={20} className="text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">Use existing resume</p>
                                <p className="text-sm text-gray-500 truncate">
                                    {getResumeFileName(currentResume)}
                                </p>
                            </div>
                        </button>
                    )}

                    {/* Upload New Resume Option */}
                    <button
                        onClick={() => {
                            setSelectedOption("upload");
                            if (!newResumeFile) {
                                fileInputRef.current?.click();
                            }
                        }}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition text-left ${selectedOption === "upload"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedOption === "upload" ? "bg-blue-500" : "bg-gray-200"
                            }`}>
                            {selectedOption === "upload" && newResumeFile ? (
                                <Check size={20} className="text-white" />
                            ) : (
                                <Upload size={20} className={selectedOption === "upload" ? "text-white" : "text-gray-500"} />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">
                                {newResumeFile ? "Upload new resume" : "Upload a resume"}
                            </p>
                            <p className="text-sm text-gray-500">
                                {newResumeFile ? newResumeFile.name : "PDF format, max 5MB"}
                            </p>
                        </div>
                        {newResumeFile && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setNewResumeFile(null);
                                    fileInputRef.current.value = "";
                                }}
                                className="p-1 hover:bg-gray-200 rounded-full"
                            >
                                <X size={16} className="text-gray-500" />
                            </button>
                        )}
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="hidden"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleContinue}
                        disabled={uploading || (!currentResume && !newResumeFile)}
                        className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            "Continue"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeSelectModal;

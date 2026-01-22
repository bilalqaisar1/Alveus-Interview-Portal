import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { App } from "@/components/app/app";
import { APP_CONFIG_DEFAULTS } from "@/app-config";
import { ThemeProvider } from "@/components/app/theme-provider";

const AIInterview = () => {
    const interviewConfig = {
        ...APP_CONFIG_DEFAULTS,
        pageTitle: "AI Interview Practice",
        pageDescription: "Practice your interview skills with our AI-powered voice assistant.",
        // agentName: "InterviewBot", // Commented out to use default agent dispatch behavior
        supportsChatInput: true,
        supportsVideoInput: false, // Voice only as per UI design
    };


    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <section className="py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-3">
                            AI Interview Practice
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Practice your interview skills with our AI-powered voice assistant.
                            Get real-time feedback and improve your confidence.
                        </p>
                    </div>

                    {/* Main Chat Interface - Integrated LiveKit Assistant */}
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="system"
                                enableSystem
                                disableTransitionOnChange
                            >
                                <App appConfig={interviewConfig} />
                            </ThemeProvider>
                        </div>


                        {/* Tips Section */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 text-xl">💡</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800">Speak Clearly</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Articulate your responses clearly for best results
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 text-xl">⏱️</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800">Take Your Time</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Pause and think before answering questions
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 text-xl">🎯</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800">Be Confident</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Practice builds confidence for real interviews
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default AIInterview;


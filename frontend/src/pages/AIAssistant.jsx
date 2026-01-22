import React, { useState, useEffect, useRef, useContext } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { Send, User, Bot, Loader2, Sparkles } from "lucide-react";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

const AIAssistant = () => {
    const { backendUrl, userData } = useContext(AppContext);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Hello ${userData?.name || "there"}! I'm your AI Career Assistant. How can I help you today?`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await axios.post(`${backendUrl}/ai-assistant/chat`, {
                messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
            });

            setMessages((prev) => [...prev, response.data.message]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col pt-10 pb-20">
                <div className="max-w-4xl mx-auto w-full px-4 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
                            <Sparkles size={16} />
                            AI Powered
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-3">
                            AI Career Assistant
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            Get instant help with your job search, resume building, and career growth.
                        </p>
                    </div>

                    {/* Chat Container */}
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col flex-1 min-h-[500px] backdrop-blur-sm bg-white/80">
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                        } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                    <div
                                        className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                            }`}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === "user"
                                                ? "bg-blue-600 text-white"
                                                : "bg-purple-100 text-purple-600 border border-purple-200"
                                                }`}
                                        >
                                            {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <div
                                                className={`p-4 rounded-2xl text-base leading-relaxed ${msg.role === "user"
                                                    ? "bg-blue-600 text-white shadow-blue-200 shadow-lg"
                                                    : "bg-gray-50 text-gray-800 border border-gray-100 shadow-sm"
                                                    }`}
                                            >
                                                {msg.content ? (
                                                    <div
                                                        className="ai-assistant-content"
                                                        dangerouslySetInnerHTML={{ __html: md.render(msg.content) }}
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 italic">No message content</span>
                                                )}
                                            </div>
                                            <div
                                                className={`text-[10px] mt-1 text-gray-400 font-medium ${msg.role === "user" ? "text-right" : "text-left"
                                                    }`}
                                            >
                                                {msg.role === "user" ? "You" : "AI Assistant"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start animate-pulse">
                                    <div className="flex gap-3 max-w-[80%]">
                                        <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-200">
                                            <Bot size={20} />
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-2xl text-gray-500 border border-gray-100 flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin" />
                                            Thinking...
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                            <form
                                onSubmit={handleSend}
                                className="relative bg-white rounded-2xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything about your career..."
                                    className="w-full bg-transparent p-4 pr-14 focus:outline-none text-gray-700"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${input.trim() && !isLoading
                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                {[
                                    "How to improve my resume?",
                                    "Interview tips for developers",
                                    "Most in-demand skills in 2026",
                                ].map((tip, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setInput(tip)}
                                        className="whitespace-nowrap bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
                                    >
                                        {tip}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AIAssistant;

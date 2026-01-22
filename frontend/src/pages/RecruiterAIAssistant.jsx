import React, { useContext, useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { AppContext } from "../context/AppContext";
import ReactMarkdown from "react-markdown";

const RecruiterAIAssistant = () => {
    const { backendUrl, companyToken, companyData } = useContext(AppContext);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hello! I'm your AI recruitment assistant. I can help you with:\n\n• Writing job descriptions\n• Screening candidate resumes\n• Interview question suggestions\n• HR policy queries\n• Hiring best practices\n\nHow can I assist you today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const { data } = await axios.post(
                `${backendUrl}/ai-assistant/chat`,
                { message: input },
                { headers: { token: companyToken } }
            );

            if (data.success) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: data.response },
                ]);
            } else {
                toast.error(data.message || "Failed to get response");
            }
        } catch (error) {
            console.error("AI Assistant error:", error);
            toast.error("Failed to get AI response");
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedPrompts = [
        "Help me write a job description for a software engineer",
        "What questions should I ask in a technical interview?",
        "How can I improve our hiring process?",
        "Tips for writing an engaging job posting",
    ];

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col max-w-4xl mx-auto">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">AI Recruitment Assistant</h1>
                <p className="text-gray-500">Get help with hiring, job postings, and more</p>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""
                            }`}
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-blue-600" : "bg-indigo-600"
                                }`}
                        >
                            {msg.role === "user" ? (
                                <User size={20} className="text-white" />
                            ) : (
                                <Bot size={20} className="text-white" />
                            )}
                        </div>
                        <div
                            className={`max-w-[75%] p-4 rounded-2xl ${msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-white border border-gray-200 rounded-tl-none"
                                }`}
                        >
                            {msg.role === "assistant" ? (
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <p>{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                                <span className="text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length <= 1 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {suggestedPrompts.map((prompt, idx) => (
                        <button
                            key={idx}
                            onClick={() => setInput(prompt)}
                            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="mt-4 flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about recruitment..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                        if (e.key === "Enter" && !loading) {
                            handleSend();
                        }
                    }}
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <Send size={20} />
                    <span className="hidden sm:inline">Send</span>
                </button>
            </div>
        </div>
    );
};

export default RecruiterAIAssistant;

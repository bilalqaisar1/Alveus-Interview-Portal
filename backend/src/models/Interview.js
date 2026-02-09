import mongoose from "mongoose";

const interviewSchema = mongoose.Schema({
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "JobApplication", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true }, // Using Company as recruiter mostly
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    date: { type: Number, required: true }, // Epoch timestamp
    meetLink: { type: String, default: "" },
    eventId: { type: String, default: "" }, // Google Calendar Event ID
    status: { type: String, default: "Scheduled" }, // Scheduled, In Progress, Completed, Cancelled, Expired
    evaluation: { type: Object, default: null }, // Stores the AI evaluation results
    evaluationAt: { type: Date, default: null },
}, { timestamps: true });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;

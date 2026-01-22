import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientType'
    },
    recipientType: {
        type: String,
        enum: ["User", "Company"],
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderType'
    },
    senderType: {
        type: String,
        enum: ["User", "Company"]
    },
    jobApplicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobApplication",
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: [
            "application_accepted",
            "application_rejected",
            "job_deleted",
            "interview_scheduled",
            "post_liked",
            "post_commented",
            "new_application",
            "new_follower"
        ],
        required: true,
    },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

// Index for efficient queries
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

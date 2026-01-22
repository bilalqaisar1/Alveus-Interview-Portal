import Notification from "../models/Notification.js";

// Get all notifications for authenticated identity (User or Company)
export const getUserNotifications = async (req, res) => {
    try {
        const recipientId = req.userData?._id || req.companyData?._id;

        const notifications = await Notification.find({ recipientId })
            .populate("senderId", "name image")
            .populate({
                path: "jobApplicationId",
                populate: [
                    { path: "jobId", select: "title" },
                    { path: "companyId", select: "name" },
                ],
            })
            .populate("postId", "content")
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};

// Mark specific notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const recipientId = req.userData?._id || req.companyData?._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipientId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification,
        });
    } catch (error) {
        console.error("Mark as read error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const recipientId = req.userData?._id || req.companyData?._id;

        await Notification.updateMany({ recipientId, read: false }, { read: true });

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.error("Mark all as read error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark all notifications as read",
        });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const recipientId = req.userData?._id || req.companyData?._id;

        const count = await Notification.countDocuments({ recipientId, read: false });

        return res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Get unread count error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get unread count",
        });
    }
};

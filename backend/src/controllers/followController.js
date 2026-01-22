import User from "../models/User.js";
import Company from "../models/Company.js";
import Notification from "../models/Notification.js";

// Follow a company
export const followCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const userId = req.userData._id;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if already following
        if (user.following.includes(companyId)) {
            return res.status(400).json({ success: false, message: "Already following this company" });
        }

        // Add to user's following list
        user.following.push(companyId);
        await user.save();

        // Add to company's followers list
        company.followers.push(userId);
        company.followerCount = company.followers.length;
        await company.save();

        // Create notification for the company
        const notification = new Notification({
            recipientId: companyId,
            recipientType: "Company",
            senderId: userId,
            senderType: "User",
            message: `${user.name} started following your company`,
            type: "new_follower",
        });
        await notification.save();

        return res.status(200).json({
            success: true,
            message: "Successfully followed company",
            followerCount: company.followerCount,
        });
    } catch (error) {
        console.error("Follow company error:", error);
        return res.status(500).json({ success: false, message: "Failed to follow company" });
    }
};

// Unfollow a company
export const unfollowCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const userId = req.userData._id;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if following
        if (!user.following.includes(companyId)) {
            return res.status(400).json({ success: false, message: "Not following this company" });
        }

        // Remove from user's following list
        user.following = user.following.filter((id) => id.toString() !== companyId);
        await user.save();

        // Remove from company's followers list
        company.followers = company.followers.filter((id) => id.toString() !== userId.toString());
        company.followerCount = company.followers.length;
        await company.save();

        return res.status(200).json({
            success: true,
            message: "Successfully unfollowed company",
            followerCount: company.followerCount,
        });
    } catch (error) {
        console.error("Unfollow company error:", error);
        return res.status(500).json({ success: false, message: "Failed to unfollow company" });
    }
};

// Get follow status
export const getFollowStatus = async (req, res) => {
    try {
        const { companyId } = req.params;
        const userId = req.userData._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        const isFollowing = user.following.includes(companyId);

        return res.status(200).json({
            success: true,
            isFollowing,
            followerCount: company.followerCount || company.followers?.length || 0,
        });
    } catch (error) {
        console.error("Get follow status error:", error);
        return res.status(500).json({ success: false, message: "Failed to get follow status" });
    }
};

// Get company followers
export const getCompanyFollowers = async (req, res) => {
    try {
        const { companyId } = req.params;

        const company = await Company.findById(companyId).populate("followers", "name image headline");
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        return res.status(200).json({
            success: true,
            followers: company.followers,
            followerCount: company.followerCount || company.followers?.length || 0,
        });
    } catch (error) {
        console.error("Get followers error:", error);
        return res.status(500).json({ success: false, message: "Failed to get followers" });
    }
};

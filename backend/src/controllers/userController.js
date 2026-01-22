import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name) {
      return res.json({ success: false, message: "Enter your name" });
    }

    if (!email) {
      return res.json({ success: false, message: "Enter your email" });
    }

    if (!password) {
      return res.json({ success: false, message: "Enter your password" });
    }

    if (!imageFile) {
      return res.json({ success: false, message: "Upload your image" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save image locally instead of Cloudinary
    const timestamp = Date.now();
    const fileExtension = path.extname(imageFile.originalname);
    const fileName = `user-profile-${timestamp}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "uploads", "user-profiles");
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move file from temp location to uploads directory
    fs.copyFileSync(imageFile.path, filePath);
    fs.unlinkSync(imageFile.path);

    // Create URL for the uploaded image
    const imageUrl = `/uploads/user-profiles/${fileName}`;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
    });

    await user.save();

    const token = await generateToken(user._id);

    return res.json({
      success: true,
      message: "Registration successful",
      userData: user,
      token,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: "Registration failed",
    });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    const token = await generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      userData: user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const fetchUserData = async (req, res) => {
  try {
    const userData = req.userData;

    return res.status(200).json({
      success: true,
      message: "user data fetched successfully",
      userData,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: "user data fetched failed",
      userData,
    });
  }
};

export const applyJob = async (req, res) => {
  try {
    const { jobId, appliedResume } = req.body;
    const userId = req.userData._id;

    if (!userId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Job ID are required",
      });
    }

    const isAlreadyApplied = await JobApplication.findOne({ userId, jobId });

    if (isAlreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const jobData = await Job.findById(jobId);

    if (!jobData) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Prevent applying to deleted jobs
    if (jobData.isDeleted) {
      return res.status(410).json({
        success: false,
        message: "This job posting is no longer available",
      });
    }

    // Use provided resume or fall back to user's current resume
    const resumeToUse = appliedResume || req.userData.resume || "";

    const jobApplication = new JobApplication({
      jobId,
      userId,
      companyId: jobData.companyId,
      date: new Date(),
      appliedResume: resumeToUse,
    });

    await jobApplication.save();

    // Create notification for the company/recruiter
    const Notification = (await import("../models/Notification.js")).default;
    const notification = new Notification({
      recipientId: jobData.companyId,
      recipientType: "Company",
      senderId: userId,
      senderType: "User",
      jobApplicationId: jobApplication._id,
      message: `${req.userData.name} applied for ${jobData.title}`,
      type: "new_application",
    });
    await notification.save();

    return res.status(201).json({
      success: true,
      message: "Job applied successfully",
      jobApplication,
      applicationId: jobApplication._id,
    });
  } catch (error) {
    console.error("Job application error:", error);

    return res.status(500).json({
      success: false,
      message: "Job application failed",
    });
  }
};

export const getUserAppliedJobs = async (req, res) => {
  try {
    const userId = req.userData._id;

    const application = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title location date status");

    return res.status(200).json({
      success: true,
      message: "Jobs application fetched successfully",
      jobApplications: application,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs application",
    });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const userId = req.userData._id;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Save resume locally instead of Cloudinary
    const timestamp = Date.now();
    const fileExtension = path.extname(resumeFile.originalname);
    const fileName = `resume-${userId}-${timestamp}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "uploads", "resumes");
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move file from temp location to uploads directory
    fs.copyFileSync(resumeFile.path, filePath);
    fs.unlinkSync(resumeFile.path);

    // Create URL for the uploaded resume
    const resumeUrl = `/uploads/resumes/${fileName}`;
    userData.resume = resumeUrl;

    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: userData.resume,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload resume",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userData._id;
    const { name } = req.body;
    const imageFile = req.file;

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields if provided
    if (name) userData.name = name;
    if (req.body.headline) userData.headline = req.body.headline;
    if (req.body.bio) userData.bio = req.body.bio;
    if (req.body.location) userData.location = req.body.location;
    if (req.body.website) userData.website = req.body.website;

    // Update image if provided
    if (imageFile) {
      // Delete old image if it exists and is local
      if (userData.image && userData.image.startsWith("/uploads/")) {
        const oldImagePath = path.join(process.cwd(), userData.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Save new image locally
      const timestamp = Date.now();
      const fileExtension = path.extname(imageFile.originalname);
      const fileName = `user-profile-${timestamp}${fileExtension}`;
      const uploadDir = path.join(process.cwd(), "uploads", "user-profiles");
      const filePath = path.join(uploadDir, fileName);

      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Move file from temp location to uploads directory
      fs.copyFileSync(imageFile.path, filePath);
      fs.unlinkSync(imageFile.path);

      // Create URL for the uploaded image
      const imageUrl = `/uploads/user-profiles/${fileName}`;
      userData.image = imageUrl;
    }

    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      userData: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        image: userData.image,
        resume: userData.resume,
        headline: userData.headline,
        bio: userData.bio,
        location: userData.location,
        coverImage: userData.coverImage,
        website: userData.website,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const userId = req.userData._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      userData.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userData.password = hashedPassword;

    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, profile: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

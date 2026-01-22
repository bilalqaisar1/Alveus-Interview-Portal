import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

import generateToken from "../utils/generateToken.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";

export const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Enter your name" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Enter your email" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Enter your password" });
    }

    if (!imageFile) {
      return res
        .status(400)
        .json({ success: false, message: "Upload your logo" });
    }

    const existingCompany = await Company.findOne({ email });

    if (existingCompany) {
      return res
        .status(409)
        .json({ success: false, message: "Company already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save image locally instead of Cloudinary
    const timestamp = Date.now();
    const fileExtension = path.extname(imageFile.originalname);
    const fileName = `company-logo-${timestamp}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "uploads", "company-logos");
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move file from temp location to uploads directory
    fs.copyFileSync(imageFile.path, filePath);
    fs.unlinkSync(imageFile.path);

    // Create URL for the uploaded image
    const imageUrl = `/uploads/company-logos/${fileName}`;

    const company = new Company({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
    });

    await company.save();

    const token = await generateToken(company._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      companyData: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const loginCompany = async (req, res) => {
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

    const company = await Company.findOne({ email });

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, company.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    const token = await generateToken(company._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      companyData: company,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const fetchCompanyData = async (req, res) => {
  try {
    const company = req.companyData;

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company data fetched successfully",
      companyData: company,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company data",
    });
  }
};

export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      level,
      salary,
      category,
      // Structured location fields
      country,
      countryCode,
      state,
      stateCode,
      city,
    } = req.body;

    if (!title || !description || !location || !level || !salary || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const companyId = req.companyData._id;

    const job = new Job({
      title,
      description,
      location,
      level,
      salary,
      category,
      companyId,
      date: Date.now(),
      // Store structured location data
      country: country || "",
      countryCode: countryCode || "",
      state: state || "",
      stateCode: stateCode || "",
      city: city || "",
    });

    await job.save();

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Job posting failed",
    });
  }
};


export const getCompanyPostedAllJobs = async (req, res) => {
  try {
    const companyId = req.companyData._id;

    const jobs = await Job.find({ companyId, isDeleted: false });

    const jobsData = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.find({ jobId: job._id });

        return { ...job.toObject(), applicants: applicants.length };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      jobData: jobsData,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Job fetching failed",
    });
  }
};

export const changeJobVisibility = async (req, res) => {
  try {
    const { id } = req.body;
    const companyId = req.companyData._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Prevent changing visibility of deleted jobs
    if (job.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot change visibility of deleted jobs",
      });
    }

    if (job.companyId.toString() === companyId.toString()) {
      job.visible = !job.visible;
    }

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Visibility changed",
    });
  } catch (error) {
    console.error("Error changing job visibility:", error);
    return res.status(500).json({
      success: false,
      message: "Visibility change failed",
    });
  }
};

export const getCompanyJobApplicants = async (req, res) => {
  try {
    const companyId = req.companyData._id;

    const applicants = await JobApplication.find({ companyId })
      .populate("userId", "name image resume")
      .populate("jobId", "title location date status");

    return res.status(200).json({
      success: true,
      message: "Applicants fetched successfully",
      viewApplicationData: applicants,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applicants",
    });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Application ID and status are required",
      });
    }

    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Job application not found",
      });
    }

    // Create notification if status is Accepted or Rejected
    if (status === "Accepted" || status === "Rejected") {
      // Fetch job and company details for the message
      const applicationDetails = await JobApplication.findById(id)
        .populate("jobId", "title")
        .populate("companyId", "name");

      if (applicationDetails) {
        const jobTitle = applicationDetails.jobId.title;
        const companyName = applicationDetails.companyId.name;

        let message = "";
        let type = "";

        if (status === "Accepted") {
          message = `Your application for ${jobTitle} at ${companyName} has been accepted! 🎉`;
          type = "application_accepted";
        } else {
          message = `Your application for ${jobTitle} at ${companyName} was not selected.`;
          type = "application_rejected";
        }

        // Dynamically import Notification model to avoid circular dependency issues if any
        const Notification = (await import("../models/Notification.js")).default;

        await Notification.create({
          recipientId: updatedApplication.userId,
          recipientType: "User",
          senderId: req.companyData._id,
          senderType: "Company",
          jobApplicationId: id,
          message,
          type,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Status changed successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to change status",
    });
  }
};

export const updateCompanyProfile = async (req, res) => {
  try {
    const companyId = req.companyData._id;
    const { name } = req.body;
    const imageFile = req.file;

    const companyData = await Company.findById(companyId);

    if (!companyData) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Update fields if provided
    if (name) companyData.name = name;
    if (req.body.headline) companyData.headline = req.body.headline;
    if (req.body.bio) companyData.bio = req.body.bio;
    if (req.body.location) companyData.location = req.body.location;
    if (req.body.website) companyData.website = req.body.website;

    // Update image if provided
    if (imageFile) {
      // Delete old image if it exists and is local
      if (companyData.image && companyData.image.startsWith("/uploads/")) {
        const oldImagePath = path.join(process.cwd(), companyData.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Save new image locally
      const timestamp = Date.now();
      const fileExtension = path.extname(imageFile.originalname);
      const fileName = `company-logo-${timestamp}${fileExtension}`;
      const uploadDir = path.join(process.cwd(), "uploads", "company-logos");
      const filePath = path.join(uploadDir, fileName);

      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Move file from temp location to uploads directory
      fs.copyFileSync(imageFile.path, filePath);
      fs.unlinkSync(imageFile.path);

      // Create URL for the uploaded image
      const imageUrl = `/uploads/company-logos/${fileName}`;
      companyData.image = imageUrl;
    }

    await companyData.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      companyData: {
        _id: companyData._id,
        name: companyData.name,
        email: companyData.email,
        image: companyData.image,
        headline: companyData.headline,
        bio: companyData.bio,
        location: companyData.location,
        coverImage: companyData.coverImage,
        website: companyData.website,
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

export const changeCompanyPassword = async (req, res) => {
  try {
    const companyId = req.companyData._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const companyData = await Company.findById(companyId);

    if (!companyData) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      companyData.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    companyData.password = hashedPassword;

    await companyData.save();

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

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.body;
    const companyId = req.companyData._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Ensure the job belongs to the authenticated company
    if (job.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this job",
      });
    }

    // Soft delete the job
    job.isDeleted = true;
    await job.save();

    // Find all applications for this job
    const applications = await JobApplication.find({ jobId: id });

    // Create notifications for each applicant
    if (applications.length > 0) {
      const Notification = (await import("../models/Notification.js")).default;

      const notifications = applications.map((app) => ({
        recipientId: app.userId,
        recipientType: "User",
        senderId: companyId,
        senderType: "Company",
        jobApplicationId: app._id,
        message: `The job ${job.title} at ${req.companyData.name} has been deleted.`,
        type: "job_deleted",
        createdAt: new Date(),
      }));

      await Notification.insertMany(notifications);
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
    });
  }
};

export const getPublicCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id).select("-password");

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    res.json({ success: true, profile: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

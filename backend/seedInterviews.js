import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";
import Company from "./src/models/Company.js";
import User from "./src/models/User.js";
import Job from "./src/models/Job.js";
import JobApplication from "./src/models/JobApplication.js";
import Interview from "./src/models/Interview.js";

const seedData = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_CONNECTION_URL || "mongodb://localhost:27017/alveus-db");
        console.log("Connected to MongoDB for seeding...");

        // 1. Clear existing test data (Optional, handle with care)
        // await Company.deleteMany({ email: "test-company@example.com" });
        // await User.deleteMany({ email: "test-candidate@example.com" });

        // 2. Create Company
        let company = await Company.findOne({ email: "test-company@example.com" });
        if (!company) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            company = await Company.create({
                name: "Test System Corp",
                email: "test-company@example.com",
                password: hashedPassword,
                image: "default_logo.png"
            });
            console.log("Test Company created.");
        }

        // 3. Create User (Candidate)
        let user = await User.findOne({ email: "test-candidate@example.com" });
        if (!user) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            user = await User.create({
                name: "John Doe",
                email: "test-candidate@example.com",
                password: hashedPassword,
                image: "default_profile.png",
                resume: "resume-123.pdf"
            });
            console.log("Test User created.");
        }

        // 4. Create Job
        let job = await Job.findOne({ title: "Software Engineer Test" });
        if (!job) {
            job = await Job.create({
                title: "Software Engineer Test",
                description: "Test Job Description",
                location: "Remote",
                category: "Tech",
                level: "Mid",
                salary: 100000,
                companyId: company._id,
                date: Date.now()
            });
            console.log("Test Job created.");
        }

        // 5. Create Job Application
        let application = await JobApplication.findOne({ userId: user._id, jobId: job._id });
        if (!application) {
            application = await JobApplication.create({
                userId: user._id,
                companyId: company._id,
                jobId: job._id,
                status: "Interview Scheduled",
                date: Date.now(),
                appliedResume: "https://example.com/resumes/john_doe_resume.pdf"
            });
            console.log("Test Application created.");
        }

        // 6. Create Interview
        const interviewExists = await Interview.findOne({ applicationId: application._id });
        if (!interviewExists) {
            const interview = await Interview.create({
                applicationId: application._id,
                candidateId: user._id,
                recruiterId: company._id,
                jobId: job._id,
                date: Date.now() + (24 * 60 * 60 * 1000), // Tomorrow
                meetLink: "https://meet.google.com/test-link",
                status: "Scheduled"
            });
            console.log("Test Interview created.");
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedData();

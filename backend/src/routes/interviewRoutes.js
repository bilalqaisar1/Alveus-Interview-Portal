import express from "express";
import { getRecommendedSlots, scheduleInterview, getUserInterviews, getCompanyInterviews } from "../controllers/interviewController.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import companyAuthMiddleware from "../middlewares/companyAuthMiddleware.js";

const router = express.Router();

// Candidate Routes
router.get("/recommended-slots", userAuthMiddleware, getRecommendedSlots);
router.post("/schedule", userAuthMiddleware, scheduleInterview);
router.get("/my-interviews", userAuthMiddleware, getUserInterviews);

// Company/Recruiter Routes
router.get("/company-interviews", companyAuthMiddleware, getCompanyInterviews);

export default router;


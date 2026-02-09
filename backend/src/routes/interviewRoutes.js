import express from "express";
import { getRecommendedSlots, scheduleInterview, getUserInterviews, getCompanyInterviews, getInterviewSummary, getInterviewLLMDetail, submitInterviewEvaluation, updateInterviewStatus } from "../controllers/interviewController.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import companyAuthMiddleware from "../middlewares/companyAuthMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Candidate Routes
router.get("/recommended-slots", userAuthMiddleware, getRecommendedSlots);
router.post("/schedule", userAuthMiddleware, scheduleInterview);
router.get("/my-interviews", userAuthMiddleware, getUserInterviews);

// Company/Recruiter Routes
router.get("/company-interviews", companyAuthMiddleware, getCompanyInterviews);
router.get("/summary", companyAuthMiddleware, getInterviewSummary);
router.get("/llm-info/:id", authMiddleware, getInterviewLLMDetail);
router.post("/submit-evaluation/:id", authMiddleware, submitInterviewEvaluation);
router.post("/status/:id", authMiddleware, updateInterviewStatus);

export default router;


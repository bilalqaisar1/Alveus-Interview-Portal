import express from "express";
import {
    followCompany,
    unfollowCompany,
    getFollowStatus,
    getCompanyFollowers,
} from "../controllers/followController.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

// User must be authenticated to follow/unfollow
router.post("/:companyId", userAuthMiddleware, followCompany);
router.delete("/:companyId", userAuthMiddleware, unfollowCompany);
router.get("/status/:companyId", userAuthMiddleware, getFollowStatus);

// Get followers (public)
router.get("/followers/:companyId", getCompanyFollowers);

export default router;

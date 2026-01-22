import express from "express";
import {
  fetchCompanyData,
  loginCompany,
  postJob,
  registerCompany,
  getCompanyPostedAllJobs,
  changeJobVisibility,
  getCompanyJobApplicants,
  changeStatus,
  updateCompanyProfile,
  changeCompanyPassword,
  deleteJob,
  getPublicCompanyProfile
} from "../controllers/companyController.js";
import upload from "../utils/upload.js";
import companyAuthMiddleware from "../middlewares/companyAuthMiddleware.js";

const router = express.Router();

router.post("/register-company", upload.single("image"), registerCompany);
router.post("/login-company", loginCompany);
router.get("/company-data", companyAuthMiddleware, fetchCompanyData);
router.post("/post-job", companyAuthMiddleware, postJob);
router.get(
  "/company/posted-jobs",
  companyAuthMiddleware,
  getCompanyPostedAllJobs
);
router.post("/change-visiblity", companyAuthMiddleware, changeJobVisibility);
router.post(
  "/view-applications",
  companyAuthMiddleware,
  getCompanyJobApplicants
);
router.post("/change-status", companyAuthMiddleware, changeStatus);
router.put(
  "/update-profile",
  companyAuthMiddleware,
  upload.single("image"),
  updateCompanyProfile
);
router.put("/change-password", companyAuthMiddleware, changeCompanyPassword);
router.post("/delete-job", companyAuthMiddleware, deleteJob);
router.get("/profile/:id", getPublicCompanyProfile);

export default router;

import express from "express";
import { createPost, getPosts, likePost, addComment, deletePost, updatePost, getAuthorPosts } from "../controllers/feedController.js";
import universalAuthMiddleware from "../middlewares/universalAuthMiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.post("/create", universalAuthMiddleware, upload.single("image"), createPost);
router.get("/all", universalAuthMiddleware, getPosts);
router.post("/like", universalAuthMiddleware, likePost);
router.post("/comment", universalAuthMiddleware, addComment);
router.delete("/delete", universalAuthMiddleware, deletePost);
router.put("/update", universalAuthMiddleware, updatePost);
router.get("/author/:authorId", universalAuthMiddleware, getAuthorPosts);

export default router;

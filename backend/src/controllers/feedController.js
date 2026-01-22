import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Company from "../models/Company.js";
import fs from "fs";
import path from "path";

export const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const authorId = req.userData?._id || req.companyData?._id;
        const authorType = req.userType === "user" ? "User" : "Company";
        const postImageFile = req.file;

        let imageUrl = "";
        if (postImageFile) {
            // Move file from temp to final destination
            const timestamp = Date.now();
            const fileExtension = path.extname(postImageFile.originalname);
            const fileName = `post-${authorId}-${timestamp}${fileExtension}`;
            const uploadDir = path.join(process.cwd(), "uploads", "posts");
            const filePath = path.join(uploadDir, fileName);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            fs.copyFileSync(postImageFile.path, filePath);
            fs.unlinkSync(postImageFile.path);

            imageUrl = `/uploads/posts/${fileName}`;
        }

        const newPost = new Post({
            content,
            imageUrl,
            authorId,
            authorType
        });

        await newPost.save();
        await newPost.populate('authorId', 'name image');

        res.json({ success: true, post: newPost });
    } catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .populate('authorId', 'name image')
            .populate('comments.userId', 'name image');

        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const likePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const userId = req.userData?._id || req.companyData?._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const userIdStr = userId.toString();
        // Correcting like logic to check if userId exists in likes array
        if (post.likes.map(id => id.toString()).includes(userIdStr)) {
            post.likes = post.likes.filter(id => id.toString() !== userIdStr);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        // Create notification for post author (if not self)
        const senderName = req.userData?.name || req.companyData?.name;
        const senderId = req.userData?._id || req.companyData?._id;
        const senderType = req.userType === "user" ? "User" : "Company";

        if (post.authorId.toString() !== senderId.toString()) {
            const notification = new Notification({
                recipientId: post.authorId,
                recipientType: post.authorType,
                senderId: senderId,
                senderType: senderType,
                postId: post._id,
                message: `${senderName} ${post.likes.map(id => id.toString()).includes(userIdStr) ? 'liked' : 'unliked'} your post: "${post.content.substring(0, 30)}..."`,
                type: "post_liked"
            });
            await notification.save();
        }

        res.json({ success: true, likes: post.likes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addComment = async (req, res) => {
    try {
        const { postId, text } = req.body;
        const userId = req.userData?._id || req.companyData?._id;
        const userType = req.userType === "user" ? "User" : "Company";

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const comment = {
            userId,
            userType,
            text,
            date: new Date()
        }

        post.comments.push(comment);
        await post.save();

        // Create notification for post author (if not self)
        const senderName = req.userData?.name || req.companyData?.name;
        const senderId = req.userData?._id || req.companyData?._id;
        const senderType = req.userType === "user" ? "User" : "Company";

        if (post.authorId.toString() !== senderId.toString()) {
            const notification = new Notification({
                recipientId: post.authorId,
                recipientType: post.authorType,
                senderId: senderId,
                senderType: senderType,
                postId: post._id,
                message: `${senderName} commented on your post: "${text.substring(0, 30)}..."`,
                type: "post_commented"
            });
            await notification.save();
        }

        const populatedPost = await Post.findById(postId).populate('comments.userId', 'name image');
        const newComment = populatedPost.comments[populatedPost.comments.length - 1];

        res.json({ success: true, comment: newComment });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const userId = req.userData?._id || req.companyData?._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Verify ownership
        if (post.authorId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Delete image if exists
        if (post.imageUrl && post.imageUrl.startsWith("/uploads/posts/")) {
            const imagePath = path.join(process.cwd(), post.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Post.findByIdAndDelete(postId);
        res.json({ success: true, message: "Post deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { postId, content } = req.body;
        const userId = req.userData?._id || req.companyData?._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Verify ownership
        if (post.authorId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        post.content = content || post.content;
        await post.save();

        res.json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAuthorPosts = async (req, res) => {
    try {
        const { authorId } = req.params;
        const posts = await Post.find({ authorId })
            .sort({ createdAt: -1 })
            .populate('authorId', 'name image headline')
            .populate('comments.userId', 'name image');

        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

import express from "express";
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
} from "../controllers/notificationController.js";
import universalAuthMiddleware from "../middlewares/universalAuthMiddleware.js";

const router = express.Router();

router.get("/", universalAuthMiddleware, getUserNotifications);
router.put("/:id/read", universalAuthMiddleware, markAsRead);
router.put("/read-all", universalAuthMiddleware, markAllAsRead);
router.get("/unread-count", universalAuthMiddleware, getUnreadCount);

export default router;

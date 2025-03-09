import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get user notifications
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt');
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Mark notification as read
router.patch("/:notificationId/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user.id },
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Mark all notifications as read
router.patch("/read-all", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router; 
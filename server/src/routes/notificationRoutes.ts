import { Router } from "express";
import {
  getNotificationsByUserId,
  updateNotificationsToRead,
} from "../controllers/notificationController";
import { authenticateToken } from "../authMiddleware";

const router = Router();
router.get("/:userId",authenticateToken, getNotificationsByUserId);
router.patch("/", authenticateToken,updateNotificationsToRead);
export default router;

import { Router } from "express";
import {
  getNotificationsByUserId,
  updateNotificationsToRead,
} from "../controllers/notificationController";

const router = Router();
router.get("/:userId", getNotificationsByUserId);
router.patch("/", updateNotificationsToRead);
export default router;

import { Router } from "express";
import { getNotificationsByUserId } from "../controllers/notificationController";

const router = Router();
router.get("/:userId",getNotificationsByUserId);

export default router;

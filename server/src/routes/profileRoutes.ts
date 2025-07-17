import { Router } from "express";
import {
  getUserDetails,
  updateUserProfile,
} from "../controllers/profileController";
import { authenticateToken } from "../authMiddleware";

const router = Router();

router.get("/", authenticateToken, getUserDetails);
router.post("/", authenticateToken, updateUserProfile);
export default router;

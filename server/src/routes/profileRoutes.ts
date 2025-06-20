import { Router } from "express";
import { getUserDetails } from "../controllers/profileController";
import { authenticateToken } from "../authMiddleware";

const router = Router();

router.get("/",authenticateToken, getUserDetails);
export default router;

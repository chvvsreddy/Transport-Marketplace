import { Router } from "express";
import { createTrip } from "../controllers/createTrip";
import { authenticateToken } from "../authMiddleware";

const router = Router();

router.post("/",authenticateToken, createTrip);

export default router;

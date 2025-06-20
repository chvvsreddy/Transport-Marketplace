import { Router } from "express";
import { createLoad } from "../controllers/postLoads";
import { authenticateToken } from "../authMiddleware";

const router = Router();

router.post("/",authenticateToken, createLoad);

export default router;

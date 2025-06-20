import { Router } from "express";
import {  getBidsByLoadId, getTripsByLoadId } from "../controllers/trips";
import { authenticateToken } from "../authMiddleware";

const router = Router();

router.post("/",authenticateToken, getBidsByLoadId);
router.put("/",authenticateToken, getTripsByLoadId);


export default router;

import { Router } from "express";
import {
  getBidsByLoadId,
  getTripByLoadId,
  getTripsByLoadId,
} from "../controllers/trips";
import { authenticateToken } from "../authMiddleware";

const router = Router();

router.post("/", authenticateToken, getBidsByLoadId);
router.put("/", authenticateToken, getTripsByLoadId);
router.get("/:loadId", authenticateToken, getTripByLoadId);

export default router;

import { Router } from "express";
import {
  deleteLoadByLoadId,
  getLoadByLoadId,
  updateLoadByLoadId,
} from "../controllers/loads";
import { authenticateToken } from "../authMiddleware";

const router = Router();

router.get("/:loadId", authenticateToken, getLoadByLoadId);
router.patch("/", authenticateToken, updateLoadByLoadId);
router.delete("/", authenticateToken, deleteLoadByLoadId);

export default router;

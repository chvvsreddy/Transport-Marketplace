import { Router } from "express";
import { getLoadByLoadId } from "../controllers/loads";
import { authenticateToken } from "../authMiddleware";

const router = Router();

router.get("/:loadId",authenticateToken,getLoadByLoadId);

export default router;

import { Router } from "express";
import { getLoadByLoadIdForAdmin } from "../controllers/adminLoads";
import { authenticateToken } from "../authMiddleware";

const router = Router();

router.get("/:loadId",authenticateToken, getLoadByLoadIdForAdmin);

export default router;

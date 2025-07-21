import { Router } from "express";

import { authenticateToken } from "../authMiddleware";
import { updateProfile, updateVehicle } from "../controllers/adminUsersProfile";

const router = Router();

router.post("/", authenticateToken, updateProfile);
router.patch("/", authenticateToken, updateVehicle);
export default router;

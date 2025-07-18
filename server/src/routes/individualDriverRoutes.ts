import { Router } from "express";

import { authenticateToken } from "../authMiddleware";
import {
  createIndividualDriverDetails,
  getIndividualDriverDetails,
} from "../controllers/driverDetailsRegister";

const router = Router();
router.post("/", createIndividualDriverDetails);
router.get("/:userId", getIndividualDriverDetails);

export default router;

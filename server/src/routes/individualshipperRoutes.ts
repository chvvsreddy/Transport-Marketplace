import { Router } from "express";

import { authenticateToken } from "../authMiddleware";
import {
  createIndividualShipperDetails,
  getIndividualShipperDetails,
} from "../controllers/IndividualShipperDetails";

const router = Router();
router.post("/", createIndividualShipperDetails);
router.get("/:userId", getIndividualShipperDetails);

export default router;

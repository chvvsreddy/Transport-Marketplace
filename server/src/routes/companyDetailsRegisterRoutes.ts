import { Router } from "express";
import {
  createCompanyDetails,
  getUserCompanyDetails,
} from "../controllers/companyDetailsRegister";
import { authenticateToken } from "../authMiddleware";

const router = Router();
router.post("/",createCompanyDetails);
router.get("/:userId",authenticateToken, getUserCompanyDetails);

export default router;

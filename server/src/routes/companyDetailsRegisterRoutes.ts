import { Router } from "express";
import {
  createCompanyDetails,
  getUserCompanyDetails,
} from "../controllers/companyDetailsRegister";

const router = Router();
router.post("/", createCompanyDetails);
router.get("/:userId", getUserCompanyDetails);

export default router;

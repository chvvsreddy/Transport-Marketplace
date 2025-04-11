import { Router } from "express";
import { getUserDetails } from "../controllers/profileController";

const router = Router();

router.get("/", getUserDetails);
export default router;

import { Router } from "express";
import { createTrip } from "../controllers/createTrip";

const router = Router();

router.post("/", createTrip);

export default router;

import { Router } from "express";
import { createLoad } from "../controllers/postLoads";

const router = Router();

router.post("/", createLoad);

export default router;

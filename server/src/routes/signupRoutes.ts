import { Router } from "express";
import { createUser } from "../controllers/usersControllar";

const router = Router();
router.post("/", createUser);

export default router;

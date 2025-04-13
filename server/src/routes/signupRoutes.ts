import { Router } from "express";
import { createUser, updatePassword } from "../controllers/usersControllar";

const router = Router();
router.post("/", createUser);
router.patch("/",updatePassword);
export default router;

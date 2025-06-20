import { Router } from "express";
import { createUser, getAllUsers } from "../controllers/usersControllar";
import { authenticateToken } from "../authMiddleware";

const router = Router();

router.get("/",authenticateToken, getAllUsers);


export default router;

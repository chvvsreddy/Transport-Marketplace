import { Router } from "express";
import { createUser, getAllUsers } from "../controllers/usersControllar";

const router = Router();

router.get("/", getAllUsers);


export default router;

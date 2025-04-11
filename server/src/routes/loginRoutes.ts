import { Router } from "express";

import { checkUser } from "../controllers/login";

const router = Router();

router.post("/", checkUser);

export default router;

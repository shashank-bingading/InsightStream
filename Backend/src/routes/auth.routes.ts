import { Router } from "express";
import { RegisterUser,loginUser } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register",RegisterUser);
router.post("/login",loginUser);

export default router;
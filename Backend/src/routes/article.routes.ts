import {Router} from "express";
import {createArticle, getUserArticles} from "../controllers/article.controller.js";
import {authenticateToken} from "../middleware/auth.middleware.js"

const router = Router();

//middleware for all routes
router.use(authenticateToken);


router.post("/",createArticle);

router.get("/",getUserArticles);

export default router;
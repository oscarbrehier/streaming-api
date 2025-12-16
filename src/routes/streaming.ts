import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requestContentController } from "../controllers/content/request.controllers.js";

const router = Router();

router.post("/sources", authMiddleware, requestContentController);

export default router;
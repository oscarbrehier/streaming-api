import { Router } from "express";
import { deleteCacheController, getCacheController, setCacheController } from "../controllers/cache/cache.controllers.js";
import { internalAuth } from "../middleware/internalAuth.middleware.js";

const router = Router();

router.get("/:key", internalAuth, getCacheController);
router.post("/", internalAuth, setCacheController);
router.delete("/", internalAuth, deleteCacheController);

export default router;
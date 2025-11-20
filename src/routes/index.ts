import { Router } from "express";
import healthRoutes from "./health.js";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const routesDir = dirname(__filename);

fs.readdirSync(routesDir).forEach(async (file) => {
	
	if (file.startsWith("index.")) return ;
	if (!file.endsWith(".ts") && !file.endsWith(".js")) return ;
	if (file.endsWith(".d.ts")) return ;

	const routesPath = path.join(routesDir, file);
	
	const module = await import(`file://${routesPath}`);
	const route = module.default;

	if (!route) return ;

	const routeName = `/${path.parse(file).name}`;
	router.use(routeName, route);

	console.log(`[router] ok: ${routeName}`);

});

router.use("/health", healthRoutes);

export default router;
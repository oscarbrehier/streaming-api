import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { initializeDirectories } from "./utils/initializeDirectories.js";
import cookieParser from "cookie-parser";
import redis from "./config/redis.js";

const app = express();
const port = process.env.PORT || 3001;

const allowedDomains = [
	process.env.APP_URL
].filter(d => d != undefined);

app.use(cors({
	origin: allowedDomains,
	credentials: true,
	allowedHeaders: ['Authorization', 'Content-Type', 'Accept']
}));

app.use(cookieParser());

app.use(express.json({ limit: "5gb" }));
app.use(express.urlencoded({ limit: "5gb", extended: true }));

app.get("/", (req: Request, res: Response) => {
	return res.status(200).json("OK");
});

app.use("/api", routes);

async function startServer() {

	try {

		if (!redis.isOpen) {
			await redis.connect();
		};

		await initializeDirectories();

		app.listen(port, () => {
			console.log(`Listening on port: ${port}`);
		});

	} catch (err) {

		console.log("Failed to start server:", err);
		process.exit(1);

	};

};

startServer();
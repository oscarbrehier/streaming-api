import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import path from "path";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
	origin: "http://localhost:3000"
}));

app.use("/api", routes);

app.use(express.json({ limit: "5gb" }));
app.use(express.urlencoded({ limit: "5gb", extended: true }));

app.use("/api/media/:id", express.static(path.join(process.cwd(), "media")));

app.listen(port, () => {
	console.log(`Listening on port: ${port}`);
});
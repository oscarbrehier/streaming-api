import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
	origin: "http://localhost:3000"
}));

app.use("/api", routes);

app.listen(port, () => {
	console.log(`Listening on port: ${port}`);
});
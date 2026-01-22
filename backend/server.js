import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./src/db/connectDB.js";
import userRoutes from "./src/routes/userRoutes.js";
import companyRoutes from "./src/routes/companyRoutes.js";
import jobRoutes from "./src/routes/jobRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import livekitRoutes from "./src/routes/livekitRoutes.js";
import interviewRoutes from "./src/routes/interviewRoutes.js";
import feedRoutes from "./src/routes/feedRoutes.js";
import aiAssistantRoutes from "./src/routes/aiAssistantRoutes.js";
import followRoutes from "./src/routes/followRoutes.js";
// import Cloudinary from "./src/utils/Cloudinary.js"; // Disabled - using local storage


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();
// Cloudinary(); // Disabled - using local storage

app.get("/", (req, res) => res.send("api is working"));

app.use("/user", userRoutes);
app.use("/company", companyRoutes);
app.use("/job", jobRoutes);
app.use("/notification", notificationRoutes);
app.use("/api", livekitRoutes);
app.use("/interview", interviewRoutes);
app.use("/feed", feedRoutes);
app.use("/ai-assistant", aiAssistantRoutes);
app.use("/follow", followRoutes);


const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`🌐Server is running on port ${PORT}`));



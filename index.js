import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import corsOptions from "./constants/corsOptions.js";
import { connectDataBase } from "./config/connectDb.js";
import configureCloudinary from "./config/cloudinaryConfig.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoutes.js";
import complaintRouter from "./routes/complaintRoutes.js";
import threadRouter from "./routes/threadRoutes.js";
import wasteCollectionRouter from "./routes/wasteCollectionEntryRoutes.js";
import recyclingpointRouter from "./routes/RecylingPointRoutes.js";
import landfillpointRouter from "./routes/landfillRoutes.js";
import chatBotRouter from "./routes/chatBotRoutes.js";

const app = express();
dotenv.config();
app.use(cookieParser());

app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors(corsOptions));

app.use("", userRouter);
app.use("/complaint", complaintRouter);
app.use("/thread", threadRouter);
app.use("/entry", wasteCollectionRouter);
app.use("/recycling", recyclingpointRouter);
app.use("/landfill", landfillpointRouter);
app.use("/", chatBotRouter);

connectDataBase();
configureCloudinary();

const server = app.listen(5000, () =>
  console.log(`Server started on port 5000`)
);

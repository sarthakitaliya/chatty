import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import {app, server} from "./lib/socket.js";
dotenv.config();


const port = process.env.PORT;

app.use(express.json({limit: '50mb'}));
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

server.listen(port, () => {
  console.log("Server is running on port " + port);
  connectDB();
});

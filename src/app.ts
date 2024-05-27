import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { createServer } from "http";
import bodyParser from "body-parser";
import express, { Request, Response, NextFunction } from "express";
import { mongoDbUri, port } from "./config/config";
import authRoutes from "./routes/auth";
import { AuthRequest, StatusError } from "./types/types";
import mlRoutes from "./routes/ml";
import userRoutes from "./routes/user";
import validateRoutes from "./routes/validation";
import chatRoutes from "./routes/chats";
import setupSocket from "./socket";
import OnlineDB from "./models/active";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(bodyParser.json()); // application/json

//* Log Middleware
app.use((req: AuthRequest, res: Response, next: NextFunction) => {
  console.log("\x1b[33m%s\x1b[0m",`API > ${req.method} ${req.url}`);
  next();
});

//* Seting up Socket
setupSocket(io);

// No Need for static folder as all Images are stored in Cloud
// app.use("/images", express.static(path.join(__dirname, "../public/images")));

//* Routes
app.use(authRoutes);
app.use("/user", userRoutes);
app.use("/validate", validateRoutes);
app.use("/chats", chatRoutes);
app.use("/ml", mlRoutes);

//* 404 Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error("Not Found") as any;
  error.statusCode = 404;
  next(error);
});

//* Error Handling Middleware
app.use(
  (error: StatusError, req: AuthRequest, res: Response, next: NextFunction) => {
    // console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    // const data = error.data;
    // res.status(status).json({ message: message, data: data });
    res.status(status).json({success:false, message: message});
  }
);

mongoose
  .connect(mongoDbUri)
  .then(async (result) => {
    // Emptying Online Collection
    await OnlineDB.deleteMany({});

    server.listen(port, () =>
      console.log("\x1b[36m%s\x1b[0m", `Server started on port ${port}`)
    );
  })
  .catch((err) => console.log(err));

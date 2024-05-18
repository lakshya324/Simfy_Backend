import path from "path";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import { mongoDbUri, port, secretKey } from "./config/config";
import authRoutes from "./routes/auth";
import { AuthRequest, StatusError, AuthSocket } from "./types/type";
import mlRoutes from "./routes/ml";
import userRoutes from "./routes/user";
import {createServer} from "http";
import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//log middleware
app.use((req: AuthRequest, res: Response, next: NextFunction) => {
  console.log(req.method, req.path);
  next();
});

//* socket.io Auth middleware
io.use(async (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decodedToken= await jwt.verify(token, secretKey) as JwtPayload;
        if (!decodedToken) {
          return next(new Error('Authentication error'));
        }else{
          (socket as AuthSocket).userId = decodedToken.userId;
          next();
        }
      } catch (err) {
        return next(new Error('Authentication error'));
      }
    } else {
        return next(new Error('Authentication error'));
    }
})

// socket.io connection
io.on("connection", (socket: AuthSocket) => {
  // Todo: update online db, load offline message from dispose db

  
  socket.on("message", (msg) => {
    // Todo: send message, recieve message
    // Todo: save message to chat db(if send) else save to dispose db
  });

  socket.on("disconnect", () => {
    // Todo: remove from online db
  });
});

app.use(cors());
app.use(bodyParser.json()); // application/json

//Todo: Load and Change images for Chats and profile pictures
app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.use(authRoutes);
app.use("/user", userRoutes);
app.use("/ml", mlRoutes);

app.use(
  (error: StatusError, req: AuthRequest, res: Response, next: NextFunction) => {
    // console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    // const data = error.data;
    // res.status(status).json({ message: message, data: data });
    res.status(status).json({ error: message });
  }
);

mongoose
  .connect(mongoDbUri)
  .then((result) => {
    server.listen(port, () =>
      console.log("\x1b[36m%s\x1b[0m", `Server started on port ${port}`)
    );
  })
  .catch((err) => console.log(err));

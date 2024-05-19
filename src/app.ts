import path from "path";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose, { Connection } from "mongoose";
import cors from "cors";
import { mongoDbUri, port, secretKey } from "./config/config";
import authRoutes from "./routes/auth";
import { AuthRequest, StatusError, AuthSocket } from "./types/types";
import mlRoutes from "./routes/ml";
import userRoutes from "./routes/user";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { isUserOnline, userOnline, userOffline } from "./utils/connect";
import { dispose } from "./utils/dispose";
import { converstionData, converstionDataToChat } from "./utils/save-message";
import User from "./models/user";
import { getAllConnections, updateLastChatTime } from "./utils/user";
import {
  saveMessageToChatDB,
  saveMessageToDisposeDB,
} from "./utils/save-message";

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
      const decodedToken = (await jwt.verify(token, secretKey)) as JwtPayload;
      if (!decodedToken) {
        return next(new Error("Authentication error"));
      } else {
        (socket as AuthSocket).userId = decodedToken.userId;
        next();
      }
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  } else {
    return next(new Error("Authentication error"));
  }
});

//* socket.io connection
io.on("connection", async (socket: Socket) => {
  // Todo: update online db, load offline message from dispose db
  // const userId = socket.userId!;
  const socketId = socket.id;
  var userId: string;

  //log middleware
  socket.onAny((event, ...args) => {
    console.log(`Socket Event: ${event} with args: ${args} by user: ${userId}`);
  });

  socket.on("authenticate", async ({ token }) => {
    if (token) {
      try {
        const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
        if (!decodedToken) {
          console.log("Authentication error");
          socket.disconnect();
          return;
        }

        // set userId
        userId = decodedToken.userId;

        // check user in db
        const user = await User.findById(userId);
        if (!user) {
          console.log("User not found!");
          socket.disconnect();
          return;
        }

        // set user online
        try {
          await userOnline(userId, socketId);
        } catch (error) {
          console.log("Error in setting user online. Error:", error);
          socket.disconnect();
          return;
        }

        //load connections and offline message from dispose db
        try {
          const messages = dispose(userId);
          const connections = getAllConnections(userId);
          await Promise.all([messages, connections]);
          if (messages && connections) {
            socket.emit("message", {
              isFlagActive: false,
              Connections: connections,
              Messages: messages,
            });
          }
        } catch (error) {
          console.log("Error in loading offline message. Error:", error);
          socket.disconnect();
          return;
        }
      } catch (err) {
        console.log("Authentication error:", err);
        socket.disconnect();
        return;
      }
    } else {
      console.log("Authentication error");
      socket.disconnect();
      return;
    }
  });

  socket.on("message", async ({ to, type, data, onPage }) => {
    // Todo: send message, recieve message, update last chat time
    // Todo: save message to chat db(if send) else save to dispose db
    // Todo: check connection then send message

    if (!userId) {
      console.log(`User not found! Socket ${socketId} disconnected!`);
      socket.disconnect();
      return;
    }
    console.log(
      "Message from:",
      userId,
      "to:",
      to,
      "type:",
      type,
      "data:",
      data
    );

    const reciver = await User.findById(to);
    if (!reciver) {
      console.log("Reciver not found!");
      socket.disconnect();
      return;
    }

    const message_stuctured = converstionData(userId, to, type, data);
    try {
      //transaction of message
      const recieverSocketId = await isUserOnline(to);
      if (recieverSocketId) {
        //* send to reciever
        // await saveMessageToChatDB(converstionDataToChat(message_stuctured, onPage));
        // await updateLastChatTime(userId, to);
        await Promise.all([
          saveMessageToChatDB(converstionDataToChat(message_stuctured, onPage)),
          updateLastChatTime(userId, to),
        ]);
        io.to(recieverSocketId).emit("message", { from: userId, type, data });
      } else {
        //* save to dispose db
        // await saveMessageToDisposeDB(message_stuctured);
        await Promise.all([
          saveMessageToDisposeDB(message_stuctured),
          updateLastChatTime(userId, to),
        ]);
      }
    } catch (error) {
      console.log("Error in sending message. Error:", error);
      socket.disconnect();
      return;
    }
  });

  socket.on("disconnect", () => {
    // Todo: remove from online db
    await userOffline(userId, socketId);
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

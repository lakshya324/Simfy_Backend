import { Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { dispose } from "../utils/dispose";
import { getAllConnections } from "../utils/user";
import { userOnline } from "../utils/connect";
import User from "../models/user";
import { secretKey } from "../config/config";

export default async (socket: Socket, token: string) => {
  const socketId = socket.id;
  try {
    const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
    if (!decodedToken) {
      console.log("Authentication error: Invalid token");
      socket.disconnect();
      return;
    }

    // set userId and check user in db
    const userId = decodedToken.userId;
    const user = await User.findById(userId);
    if (!user) {
      console.log("Authentication error: User not found");
      socket.disconnect();
      return;
    }

    // set user online
    await userOnline(userId, socketId);

    //load connections and offline message from dispose db
    //Todo: outsource this to a separate function
    const messages = await dispose(userId);
    const connections = await getAllConnections(userId);
    console.log("Messages:", messages);
    if (messages && connections) {
      socket.emit("message", {
        isFlagActive: false,
        Connections: connections,
        Messages: messages,
      });
    }

    return userId; // Return userId for further use

  } catch (error) {
    console.log("Authentication error:", error);
    socket.disconnect();
    return;
  }
};

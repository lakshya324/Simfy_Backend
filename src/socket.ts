import { Server } from "socket.io";
import authenticateHandler from "./handlers/authenticateHandler";
import connectionHandler from "./handlers/connectionHandler";
import messageHandler from "./handlers/messageHandler";
import statusHandler from "./handlers/statusHandler";
import { userOffline } from "./utils/connect";

export default (io: Server) => {
  io.on("connection", (socket) => {
    connectionHandler(io)(socket);
    var userId: string;
    
    //* log middleware
    socket.onAny((event, ...args) => {
      console.log("\x1b[33m%s\x1b[0m",`SOCKET > ${event} => ${socket.id} [${userId ? `User ${userId}` : "User not authenticated"}]`);
    });

    socket.on("authenticate", async ({ token },ack) => {
      userId = await authenticateHandler(socket, token);
      if (userId) {
        console.log(`User ${userId} authenticated`);
        messageHandler(socket, userId);
        statusHandler(socket, userId);
        return ack({ Auth: true });
      }else{
        return ack({ Auth: false });
      }
    });

    socket.on("disconnect", () => {
      if (userId) {
        const socketId = socket.id;
        console.log(`User ${userId} disconnected!`);
        userOffline(userId);
      } else {
        console.log(`Socket ${socket.id} disconnected!`);
      }
    });
  });
};
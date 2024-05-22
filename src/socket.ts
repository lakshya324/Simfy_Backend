import { Server } from "socket.io";
import authenticateHandler from "./handlers/authenticateHandler";
import connectionHandler from "./handlers/connectionHandler";
import messageHandler from "./handlers/messageHandler";
import { userOffline } from "./utils/connect";

export default (io: Server) => {
  io.on("connection", (socket) => {
    connectionHandler(io)(socket);
    var userId: string;
    socket.on("authenticate", async ({ token }) => {
      userId = await authenticateHandler(socket, token);
      if (userId) {
        console.log(`User ${userId} authenticated`);
        messageHandler(socket, userId);
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

// export const setupSocket = (io: Server) => {
//   io.on("connection", (socket) => {
//     connectionHandler(io)(socket);

//     socket.on("authenticate", async ({ token }) => {
//       const socketId = socket.id;
//       if (token) {
//         try {
//           const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
//           if (!decodedToken) {
//             console.log("Authentication error");
//             socket.disconnect();
//             return;
//           }

//           // set userId
//           const userId = decodedToken.userId;

//           // check user in db
//           const user = await User.findById(userId);
//           if (!user) {
//             console.log("User not found!");
//             socket.disconnect();
//             return;
//           }

//           // set user online
//           try {
//             await userOnline(userId, socketId);
//           } catch (error) {
//             console.log("Error in setting user online. Error:", error);
//             socket.disconnect();
//             return;
//           }

//           //load connections and offline message from dispose db
//           try {
//             const messages = await dispose(userId);
//             const connections = await getAllConnections(userId);
//             // await Promise.all([messages, connections]);
//             if (messages && connections) {
//               socket.emit("message", {
//                 isFlagActive: false,
//                 Connections: connections,
//                 Messages: messages,
//               });
//             }
//           } catch (error) {
//             console.log("Error in loading offline message. Error:", error);
//             socket.disconnect();
//             return;
//           }
//         } catch (err) {
//           console.log("Authentication error:", err);
//           socket.disconnect();
//           return;
//         }
//       } else {
//         console.log("Authentication error");
//         socket.disconnect();
//         return;
//       }
//     });
//   });
// };

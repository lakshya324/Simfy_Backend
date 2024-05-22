import { Socket } from "socket.io";
import { converstionData, converstionDataToChat } from "../utils/save-message";
import { isUserOnline } from "../utils/connect";
import { saveMessageToChatDB, saveMessageToDisposeDB } from "../utils/save-message";
import { updateLastChatTime } from "../utils/user";
import User from "../models/user";

export default (socket: Socket, userId: string) => {
  socket.on("message", async ({ to, type, data }) => {
    if (!userId) {
      console.log(`User not found! Socket ${socket.id} disconnected!`);
      socket.disconnect();
      return;
    }

    console.log(`Message received [${userId}-> ${to}] Type: ${type} Data: ${data}`);

    const reciver = await User.findById(to);
    if (!reciver) {
      console.log("Receiver not found!");
      socket.disconnect();
      return;
    }

    const messageStructured = converstionData(userId, to, type, data);
    try {
      //todo: outsource this to a separate function
      const receiverSocketId = await isUserOnline(to);
      if (receiverSocketId) {
        // user is online
        const messageId= await saveMessageToChatDB(converstionDataToChat(messageStructured));
        if (!messageId) {
          console.log("Error in saving message to chat db.");
          socket.disconnect();
          return;
        }
        await updateLastChatTime(userId, to);
        socket.to(receiverSocketId).emit("message", { isFlagActive: true,messageId, from: userId, type, data });
        //todo: send message to sender (t f f)
        // if return to /status listener
        //update status to delivered (t t f)
      } else {
        // user is offline
        await saveMessageToDisposeDB(messageStructured);
        await updateLastChatTime(userId, to);
        //todo: send message to sender (t f f)
      }
    } catch (error) {
      console.log("Error in sending message. Error:", error);
      socket.disconnect();
      return;
    }
  });
};

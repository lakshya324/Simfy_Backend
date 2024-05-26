import { Socket } from "socket.io";
import { converstionData, converstionDataToChat } from "../utils/save-message";
import { isUserOnline } from "../utils/connect";
import {
  saveMessageToChatDB,
  saveMessageToDisposeDB,
} from "../utils/save-message";
import { updateLastChatTime } from "../utils/user";
import User from "../models/user";

export default (socket: Socket, userId: string) => {
  //TODO:Refactor this code
  socket.on("message", async ({ to, type, data }, callBack) => {
    if (!userId || !to || !type || !data) {
      console.log(`User not found! Socket ${socket.id} disconnected!`);
      socket.disconnect();
      return;
    }

    if (!callBack) {
      console.log(`CallBack for User ${userId} not Found!`);
      socket.disconnect();
      return;
    }

    console.log(
      `Message received [${userId}-> ${to}] Type: ${type} Data: ${data}`
    );

    const reciver = await User.findById(to);
    if (!reciver) {
      console.log("Receiver not found!");
      socket.disconnect();
      return;
    }

    //TODO: outsource this to a separate function
    const disposeMessageStructured = converstionData(userId, to, type, data);
    try {
      const messageId = await saveMessageToChatDB(
        converstionDataToChat(disposeMessageStructured, false)
      );
      if (!messageId) {
        console.log("Error in saving message to chat db.");
        socket.disconnect();
        return;
      }
      await saveMessageToDisposeDB(disposeMessageStructured,messageId);
      const receiverSocketId = await isUserOnline(to);
      if (receiverSocketId) {
        //* user is online
        socket
          .to(receiverSocketId)
          .emit("message", {
            isFlagActive: true,
            messageId,
            from: userId,
            type,
            data,
          });
      }
      await updateLastChatTime(userId, to);
      // Returning messageId to FrontEnd
      callBack({ from: userId, to, messageId });
    } catch (error) {
      console.log("Error in sending message. Error:", error);
      socket.disconnect();
      return;
    }
  });
};

import { Socket } from "socket.io";
import ChatDB from "../models/chats";
import { isUserOnline } from "../utils/connect";
import DisposeDB from "../models/waiting";

export default (socket: Socket, userId: string) => {
  socket.on("status", async ({ messageId, delivered, seen }) => {
    if (!messageId) {
      console.log("messageId is required in Status event");
      socket.disconnect();
      return;
    }

    const message = await ChatDB.findById(messageId);
    if (!message) {
      console.log("Message not found");
      socket.disconnect();
      return;
    }

    if (message.to.toString() !== userId.toString()) {
      socket.disconnect();
      return;
    }

    if (message.meta_data!.read) {
      return;
    }

    if (!delivered && seen) {
      console.log("Invalid status event");
      socket.disconnect();
      return;
    }


    const fromOnline = await isUserOnline(message.from.toString());
    if (delivered && !message.meta_data!.delivered_time) {
      message.meta_data!.delivered_time = new Date();
      await message.save();
      //delete from DisposeDB
      await DisposeDB.deleteOne({ chatId: messageId });
      if (fromOnline) {
        socket.to(fromOnline).emit("status", {
          from: message.from.toString(),
          to: message.from.toString(),
          messageId,
          delivered: true,
          seen: false,
        });
      }
    }
    if (seen && !message.meta_data!.read) {
      message.meta_data!.read = true;
      message.meta_data!.seen_time = new Date();
      await message.save();
      if (fromOnline) {
        socket.to(fromOnline).emit("status", {
          from: message.from.toString(),
          to: message.from.toString(),
          messageId,
          delivered: true,
          seen: true,
        });
      }
    }
  });
};

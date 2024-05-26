import DisposeDB from "../models/waiting";
import ChatDB from "../models/chats";
import { Message, Dispose, Chat } from "../types/message-type";
import { Types } from "mongoose";

export async function dispose(userId: string) {
  const disposeChats = await DisposeDB.find({ to: userId });
  return disposeChats;
}

export async function deliveredDispose(from: string, to: string) {
  try {
    const disposeChats = await DisposeDB.find({ from, to });
    const messageIds: Types.ObjectId[] = [];
    // const messageDeliverIds: Types.ObjectId[] = [];
    // const messageSentIds: Types.ObjectId[] = [];
    const disposeIds: Types.ObjectId[] = [];

    disposeChats.forEach((chat) => {
      messageIds.push(chat.chatId);
      disposeIds.push(chat._id);
    });

    if (disposeIds.length > 0) {
      await DisposeDB.deleteMany({ _id: { $in: disposeIds } });
    }

    if (messageIds.length > 0) {
    //   console.log("messageIds:", messageIds);
      await ChatDB.updateMany(
        { _id: { $in: messageIds } },
        {
          $set: {
            "meta_data.read": true,
            "meta_data.seen_time": new Date(),
            "meta_data.delivered_time": new Date(),
          },
        }
      );
    }
  } catch (error) {
    console.error("Error processing deliveredDispose:", error);
  }
}

// not a DisposeDB function [Converts Delivered -> Seen in ChatDB]
export async function deliveredSeenDispose(from: string, to: string) {
  try {
    const deliveredChats = await ChatDB.find({
      from,
      to,
      "meta_data.read": false,
      "meta_data.seen_time": null,
    });
    await ChatDB.updateMany(
      { _id: { $in: deliveredChats.map((chat) => chat._id) } },
      {
        $set: {
          "meta_data.read": true,
          "meta_data.seen_time": new Date(),
        },
      }
    );
  } catch (error) {
    console.error("Error processing deliveredSeenDispose:", error);
  }
}

// export async function dispose(
//   userId: string,
//   deleteFromDispose: boolean = false
// ): Promise<Dispose[] | undefined> {
//   const disposeChats = await DisposeDB.find({ to: userId });
//   const disposeChatsId: string[] = [];
//   const saveChats: Chat[] = [];

//   if (!disposeChats) {
//     return;
//   }
//   if (disposeChats.length === 0) {
//     return [];
//   }
//   if (disposeChats.length > 0) {
//     const disposeMessages: Dispose[] = [];
//     disposeChats.forEach((chat) => {
//       const message: Message = {
//         message_type: chat.message!.message_type,
//         data: chat.message!.data,
//       };
//       const disposeChat: Dispose = {
//         from: chat.from.toString(),
//         to: chat.to.toString(),
//         message: message,
//         sent_time: chat.sent_time,
//       };
//       const savingChat: Chat = {
//         ...disposeChat,
//         meta_data: {
//           read: false,
//           seen_time: null,
//           delivered_time: new Date(),
//         },
//       };

//       disposeChatsId.push(chat._id.toString());
//       disposeMessages.push(disposeChat);
//       saveChats.push(savingChat);
//     });

//     //move to chat collection and delete from dispose collection
//     // await ChatDB.insertMany(saveChats);
//     if (deleteFromDispose) {
//       await DisposeDB.deleteMany({ _id: { $in: disposeChatsId } });
//     }

//     // console.log("Dispose messages:", disposeMessages);
//     return disposeMessages;
//   }
// }

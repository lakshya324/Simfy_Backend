import DisposeDB from "../models/waiting";
import ChatDB from "../models/chats";
import { Message,Dispose, Chat } from "../types/message-type";

export async function dispose(userId: string): Promise<Dispose[] | undefined> {
    const disposeChats = await DisposeDB.find({ to: userId });
    const disposeChatsId: string[] = [];
    const saveChats: Chat[] = [];

    if (!disposeChats) {
        return;
    }
    if (disposeChats.length === 0) {
        return [];
    }
    if (disposeChats.length > 0) {
        const disposeMessages: Dispose[] = [];
        disposeChats.forEach((chat) => {
            const message: Message = {
                message_type: chat.message!.message_type,
                data: chat.message!.data,
            };
            const disposeChat: Dispose={
                from: chat.from.toString(),
                to: chat.to.toString(),
                message: message,
                sent_time: chat.sent_time,
            };
            const savingChat: Chat = {
                ...disposeChat,
                meta_data: {
                    read: false,
                    seen_time: null,
                    delivered_time: new Date(),
                },
            };

            disposeChatsId.push(chat._id.toString());
            disposeMessages.push(disposeChat);
            saveChats.push(savingChat);
        });

        //move to chat collection and delete from dispose collection
        await ChatDB.insertMany(saveChats);
        await DisposeDB.deleteMany({ _id: { $in: disposeChatsId } });
        
        console
        return disposeMessages;
    }
}